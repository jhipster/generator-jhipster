package <%=packageName%>.config.reload.listener.filewatcher;

import <%=packageName%>.config.reload.FileSystemWatcher;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springsource.loaded.ReloadableType;
import org.springsource.loaded.TypeRegistry;
import org.springsource.loaded.Utils;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Path;
import java.nio.file.StandardWatchEventKinds;
import java.nio.file.WatchEvent;
import java.util.HashMap;
import java.util.Map;

/**
 * Support only new class.
 * The class will be loaded from the fileSystem and let Spring Loaded to handle it.
 */
public class NewClassLoaderListener implements FileWatcherListener {

    private Logger log = LoggerFactory.getLogger(NewClassLoaderListener.class);

    private ClassLoader parentClassLoader;
    private Map<String, URLClassLoader> urlClassLoaderMap = new HashMap<>();


    @Override
    public void setFileSystemWatcher(FileSystemWatcher fileSystemWatcher) {
        parentClassLoader = fileSystemWatcher.getClassLoader();

        for (String watchFolder : fileSystemWatcher.getWatchFolders()) {
            try {
                URLClassLoader urlClassLoader = new URLClassLoader(new URL[] {new File(watchFolder).toURI().toURL()}, parentClassLoader);
                urlClassLoaderMap.put(watchFolder, urlClassLoader);
            } catch (MalformedURLException e) {
                log.error("Failed to register the URL classLoader for the folder '{}'", watchFolder);
            }
        }
    }

    @Override
    public boolean support(Path file, WatchEvent.Kind kind) {
        return kind == StandardWatchEventKinds.ENTRY_CREATE &&
                StringUtils.equals(FilenameUtils.getExtension(file.toFile().getName()), "class");
    }

    @Override
    public void onChange(String parentFolder, Path file, WatchEvent.Kind kind) {
        loadClassFromPath(parentFolder, file.toFile().getName(), file.toFile());
    }

    private void loadClassFromPath(String parentDir, String fileName, File theFile) {

        log.debug("JHipster reload - Start to reload the new class '{}'", theFile.getAbsolutePath());
        // A class has been added, so it needs to be added to the classloader
        try {
            Map.Entry<String, URLClassLoader> urlLoaderEntry = selectUrlLoaderEntry(parentDir);

            if (urlLoaderEntry == null) {
                log.error("Failed to find a watched folder for the directory: {}", parentDir);
                return;
            }
            final String classesFolder = urlLoaderEntry.getKey();
            final URLClassLoader urlClassLoader = urlLoaderEntry.getValue();
            // Try to load the new class
            // First we need to remove the global classesFolder from the child path
            String slashedClassPath = StringUtils.substringAfter(parentDir, classesFolder);
            if (slashedClassPath.startsWith("/")) {
                slashedClassPath = slashedClassPath.substring(1);
            }
            // Replace / by . to create the dottedClassName
            String dottedClassPath = slashedClassPath.replace("/", ".");

            String slashedClassName = slashedClassPath + "/" + StringUtils.substringBefore(fileName, ".");
            String dottedClassName = dottedClassPath + "." + StringUtils.substringBefore(fileName, ".");

            // Retrieve the Spring Loaded registry.
            // We will use to validate the class has not been already loaded
            TypeRegistry typeRegistry = TypeRegistry.getTypeRegistryFor(parentClassLoader);

            // Load the class
            urlClassLoader.loadClass(dottedClassName);

            // Force SpringLoaded to instrument the class
            if (typeRegistry != null) {
                String versionstamp = Utils.encode(theFile.lastModified());
                ReloadableType rtype = typeRegistry.getReloadableType(slashedClassName);
                typeRegistry.fireReloadEvent(rtype, versionstamp);
            }
        } catch (Exception e) {
            log.error("Failed to load the class named: {}", fileName, e);
        }
    }

    private Map.Entry<String, URLClassLoader> selectUrlLoaderEntry(String dir) {
        for (Map.Entry<String, URLClassLoader> urlClassLoaderEntry : urlClassLoaderMap.entrySet()) {
            final String key = urlClassLoaderEntry.getKey();
            if (StringUtils.contains(dir, key)) {
                return urlClassLoaderEntry;
            }
        }
        return null;
    }
}
