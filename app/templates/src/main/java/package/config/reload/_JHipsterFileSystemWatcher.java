package <%=packageName%>.config.reload;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springsource.loaded.ReloadableType;
import org.springsource.loaded.TypeRegistry;
import org.springsource.loaded.Utils;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.CodeSigner;
import java.security.CodeSource;
import java.security.ProtectionDomain;
import java.util.HashMap;
import java.util.Map;

import static java.nio.file.LinkOption.NOFOLLOW_LINKS;
import static java.nio.file.StandardWatchEventKinds.ENTRY_CREATE;

/**
 * A watcher for the target class folder.
 * 
 * The watcher will monitor all folders and sub-folders to check if a new class
 * is created. If so, the new class will be loaded and managed by Spring-Loaded.
 */
public class JHipsterFileSystemWatcher implements Runnable {

    public static final String TARGET_CLASSES_FOLDER = "targetClassFolder";

    private static Logger logger = LoggerFactory.getLogger(JHipsterFileSystemWatcher.class);

    public static boolean isStarted;

    private final WatchService watcher;
    private final Map<WatchKey, Path> keys;
    private String classesFolder;
    private ClassLoader mainClassLoader;
    private NewFileClassLoader classLoader;

    public JHipsterFileSystemWatcher(String classesFolder, ClassLoader classLoader) throws Exception {
        isStarted = true;

        final Path classesFolderPath = FileSystems.getDefault().getPath(classesFolder);

        this.classesFolder = classesFolder;
        this.mainClassLoader = classLoader;
        this.classLoader = new NewFileClassLoader(classLoader, classesFolderPath);

        watcher = FileSystems.getDefault().newWatchService();

        this.keys = new HashMap<>();
        registerAll(classesFolderPath);
    }

    /**
     * Register the classLoader and start a thread that will be used to monitor folders where classes can be created.
     *
     * @param classLoader the classLoader of the application
     */
    public static void register(ClassLoader classLoader) {
        try {
            final String targetClassesFolder = System.getProperty(TARGET_CLASSES_FOLDER);

            if (StringUtils.isEmpty(targetClassesFolder)) {
                logger.warn("SpringLoaded - Unable to load new classes. The -DtargetClassFolder property must be set.");
                return;
            }

            final Thread thread = new Thread(new JHipsterFileSystemWatcher(targetClassesFolder, classLoader));
            thread.setDaemon(true);
            thread.start();

            Runtime.getRuntime().addShutdownHook(new Thread() {
                public void run() {
                    JHipsterFileSystemWatcher.isStarted = false;
                    try {
                        thread.join();
                    } catch (InterruptedException e) {
                        logger.error("Failed during the JVM shutdown", e);
                    }
                }
            });
        } catch (Exception e) {
            logger.error("Failed to start the watcher. New class will not be loaded.", e);
        }
    }

    /**
     * Register the given directory, and all its sub-directories, with the
     * WatchService.
     */
    private void registerAll(final Path start) throws IOException {
        // register directory and sub-directories
        Files.walkFileTree(start, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
                    throws IOException {
                register(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    /**
     * Register the given directory with the WatchService.
     */
    private void register(Path dir) throws IOException {
        WatchKey key = dir.register(watcher, ENTRY_CREATE);
        Path prev = keys.get(key);
        if (prev == null) {
            logger.debug("Directory : '{}' will be monitored for changes", dir);
        }
        keys.put(key, dir);
    }

    /**
     * Process all events for keys queued to the watcher.
     * 
     * When the event is a ENTRY_CREATE, the folders will be added to the watcher,
     * the classes will be loaded by SpringLoaded
     */
    public void run() {
        while (isStarted) {
            // wait for key to be signalled
            WatchKey key;
            try {
                key = watcher.take();
            } catch (InterruptedException x) {
                return;
            }

            Path dir = keys.get(key);
            if (dir == null) {
                continue;
            }

            for (WatchEvent<?> event : key.pollEvents()) {
                WatchEvent.Kind kind = event.kind();

                // Context for directory entry event is the file name of entry
                // noinspection unchecked
                WatchEvent<Path> ev = (WatchEvent<Path>) event;
                Path name = ev.context();
                Path child = dir.resolve(name);

                // if directory is created, and watching recursively, then
                // register it and its sub-directories
                if (kind == ENTRY_CREATE) {
                    try {
                        if (Files.isDirectory(child, NOFOLLOW_LINKS)) {
                            registerAll(child);
                        } else {
                            // A class has been added, so it needs to be added to the classloader
                            try {
                                // Try to load the new class
                                // First we need to remove the global classesFolder from the child path
                                String slashedClassPath = StringUtils.substringAfter(dir.toString(), classesFolder);
                                if (slashedClassPath.startsWith("/")) {
                                    slashedClassPath = slashedClassPath.substring(1);
                                }

                                // Replace / by . to create the dottedClassName
                                String dottedClassPath = slashedClassPath.replace("/", ".");

                                String slashedClassName = slashedClassPath + "/" + StringUtils.substringBefore(name.toString(), ".");
                                String dottedClassName = dottedClassPath + "." + StringUtils.substringBefore(name.toString(), ".");

                                // Retrieve the Spring Loaded registry.
                                // We will use to validate the class has not been already loaded
                                TypeRegistry typeRegistry = TypeRegistry.getTypeRegistryFor(classLoader);

                                ReloadableType rtype = null;
                                // Check if the class has already loaded by the agent
                                if (typeRegistry != null) {
                                    rtype = typeRegistry.getReloadableType(slashedClassName);
                                }

                                if (rtype == null) {
                                    // Load the new class with the class loader.
                                    classLoader.loadClass(dottedClassName, IOUtils.toByteArray(child.toUri()));

                                    // Now we can retrieve the TypeRegistry
                                    typeRegistry = TypeRegistry.getTypeRegistryFor(classLoader);

                                    // Force SpringLoaded to instrument the class
                                    if (typeRegistry != null) {
                                        String versionstamp = Utils.encode(child.toFile().lastModified());
                                        rtype = typeRegistry.getReloadableType(slashedClassName);
                                        typeRegistry.fireReloadEvent(rtype, versionstamp);
                                    }
                                    logger.debug("New class : '{}' has been loaded", dottedClassName);
                                }
                            } catch (Exception e) {
                                logger.error("Failed to load the class named {}", name.toString(), e);
                            }
                        }
                    } catch (IOException x) {
                        logger.error("Failed to load the class named {}", name.toString(), x);
                    }
                }
            }

            // reset key and remove from set if directory no longer accessible
            boolean valid = key.reset();
            if (!valid) {
                keys.remove(key);

                // all directories are inaccessible
                if (keys.isEmpty()) {
                    break;
                }
            }
        }
    }

    /**
     * This custom class loader is mandatory to call the defineClass method.
     * 
     * Once the new class is defined, the JVM calls the agent to instrument the new
     * class that has been created
     */
    public class NewFileClassLoader extends ClassLoader {

        ProtectionDomain protectionDomain;

        public NewFileClassLoader(ClassLoader parent, Path classesFolder) throws MalformedURLException {
            super(parent);
            CodeSource codeSource = new CodeSource(classesFolder.toFile().toURI().toURL(), (CodeSigner[]) null);
            protectionDomain = new ProtectionDomain(codeSource, null, parent, null);
        }

        public Class loadClass(String dottedClassName, byte[] classData) throws ClassNotFoundException {
            return super.defineClass(dottedClassName, classData, 0, classData.length, protectionDomain);
        }
    }
}
