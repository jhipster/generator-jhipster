package <%=packageName%>.config.reload;

import <%=packageName%>.config.reload.listener.filewatcher.FileWatcherListener;
import <%=packageName%>.config.reload.listener.filewatcher.NewClassLoaderListener;
import com.sun.nio.file.SensitivityWatchEventModifier;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.nio.file.LinkOption.NOFOLLOW_LINKS;
import static java.nio.file.StandardWatchEventKinds.ENTRY_CREATE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY;

/**
 * A watcher for the target class folder.
 * 
 * The watcher will monitor all folders and sub-folders to check if a new class
 * is created. If so, the new class will be loaded and managed by Spring-Loaded.
 */
public class JHipsterFileSystemWatcher implements FileSystemWatcher, Runnable {

    private static Logger log = LoggerFactory.getLogger(JHipsterFileSystemWatcher.class);

    private static boolean isStarted;
    private final WatchService watcher;
    private final Map<WatchKey, Path> keys = new HashMap<>();
    private final List<FileWatcherListener> fileWatcherListeners = new ArrayList<>();
    private final List<String> watchFolders;
    private final ConfigurableApplicationContext ctx;
    private final ClassLoader classLoader;


    public JHipsterFileSystemWatcher(List<String> watchFolders, ConfigurableApplicationContext ctx, ClassLoader classLoader) throws Exception {
        this.watchFolders = watchFolders;
        this.ctx = ctx;
        this.classLoader = classLoader;
        watcher = FileSystems.getDefault().newWatchService();

        // Register all folders
        for (String watchFolder : watchFolders) {
            final Path classesFolderPath = FileSystems.getDefault().getPath(watchFolder);
            watchDirectory(classesFolderPath);
        }

        registerFileWatcherListeners();

        isStarted = true;
    }

    /**
     * Register the classLoader and start a thread that will be used to monitor folders where classes can be created.
     *
     * @param classLoader the classLoader of the application
     * @param ctx the spring application context
     */
    public static void register(ClassLoader classLoader, ConfigurableApplicationContext ctx) {
        try {
            Environment env = ctx.getEnvironment();

            // Load from env the list of folders to watch
            List<String> watchFolders = getWatchFolders(env);

            if (watchFolders.size() == 0) {
                log.warn("SpringLoaded - No watched folders have been defined in the application-{profile}.yml. " +
                        "We will use the default target/classes");
                watchFolders.add("target/classes");
            }

            final Thread thread = new Thread(new JHipsterFileSystemWatcher(watchFolders, ctx, classLoader));
            thread.setDaemon(true);
            thread.start();

            Runtime.getRuntime().addShutdownHook(new Thread() {
                public void run() {
                    JHipsterFileSystemWatcher.isStarted = false;
                    try {
                        thread.join();
                    } catch (InterruptedException e) {
                        log.error("Failed during the JVM shutdown", e);
                    }
                }
            });
        } catch (Exception e) {
            log.error("Failed to start the watcher. New class will not be loaded.", e);
        }
    }

    @Override
    public ClassLoader getClassLoader() {
        return classLoader;
    }

    @Override
    public ConfigurableApplicationContext getConfigurableApplicationContext() {
        return ctx;
    }

    @Override
    public List<String> getWatchFolders() {
        return watchFolders;
    }

    /**
     * Register the given directory, and all its sub-directories, with the
     * WatchService.
     */
    public void watchDirectory(final Path start) {
        // register directory and sub-directories
        try {
            Files.walkFileTree(start, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
                        throws IOException {
                    register(dir);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException e) {
            log.error("Failed to register the directory '{}'", start);
        }
    }

    /**
     * Register the given directory with the WatchService.
     */
    private void register(Path dir) throws IOException {
        WatchKey key = dir.register(watcher, new WatchEvent.Kind[]{ENTRY_CREATE, ENTRY_MODIFY}, SensitivityWatchEventModifier.HIGH);
        Path prev = keys.get(key);
        if (prev == null) {
            log.debug("Directory : '{}' will be monitored for changes", dir);
        }
        keys.put(key, dir);
    }

    /**
     * Process all events for keys queued to the watcher.
     * 
     * When the event is a ENTRY_CREATE or ENTRY_MODIFY, the folders will be added to the watcher,
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
                if (Files.isDirectory(child, NOFOLLOW_LINKS)) {
                    watchDirectory(child);
                    // load the classes that have been copied
                    final File[] classes = child.toFile().listFiles((FileFilter) new SuffixFileFilter(".class"));
                    for (File aFile : classes) {
                        final String parentFolder = aFile.getParent();
                        callFileWatcherListerners(parentFolder, aFile.toPath(), kind);
                    }
                } else {
                    callFileWatcherListerners(dir.toString(), child, kind);
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
     * The definition of the folders to watch must be defined in the application-dev.yml as follow
     *   hotReload:
     *     enabled: true
     *     watchdir:
     *        - /Users/jhipster/demo-jhipster/target/classes
     *        - /Users/jhipster/demo-jhipster/target/classes1

     * @param env the environment used to retrieve the list of folders
     * @return the list of folders
     */
    private static List<String> getWatchFolders(Environment env) {
        List<String> results = new ArrayList<>();

        int i=0;

        String folder = env.getProperty("hotReload.watchdir[" + i + "]");

        while(folder != null) {
            results.add(folder);
            i++;
            folder = env.getProperty("hotReload.watchdir[" + i + "]");
        }

        return results;
    }


    /**
     * Register the list of listeners
     */
    private void registerFileWatcherListeners() {
        fileWatcherListeners.add(new NewClassLoaderListener());

        for (FileWatcherListener fileWatcherListener : fileWatcherListeners) {
            fileWatcherListener.setFileSystemWatcher(this);
        }
    }

    /**
     * Call all listeners on changed file
     */
    private void callFileWatcherListerners(String parentFolder, Path child, WatchEvent.Kind kind) {
        for (FileWatcherListener fileWatcherListener : fileWatcherListeners) {
            if (fileWatcherListener.support(child, kind)) {
                fileWatcherListener.onChange(parentFolder, child, kind);
            }
        }
    }
}
