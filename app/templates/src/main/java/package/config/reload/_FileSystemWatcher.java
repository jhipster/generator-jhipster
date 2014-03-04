package <%=packageName%>.config.reload;

import org.springframework.context.ConfigurableApplicationContext;

import java.nio.file.Path;
import java.util.List;

public interface FileSystemWatcher {

    ClassLoader getClassLoader();

    ConfigurableApplicationContext getConfigurableApplicationContext();

    List<String> getWatchFolders();

    /**
     * Register the given directory, and all its sub-directories, with the
     * WatchService.
     */
    void watchDirectory(final Path start);
}
