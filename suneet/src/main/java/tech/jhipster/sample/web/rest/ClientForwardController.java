package tech.jhipster.sample.web.rest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ClientForwardController {

    // File names with extension.
    public static final String FORBID_EXTENSION_PATTERN = "/{file:[^\\.]*}";

    // Folders with trailing separator.
    public static final String TRAILING_DIR_PATTERN = "/{traillingDir:.*}/";

    /**
     * Forwards any unmapped paths (except file names containing a period) to the client {@code index.html}.
     * @return forward to client {@code index.html}.
     */
    @GetMapping(
        value = {
            FORBID_EXTENSION_PATTERN,
            "/*" + FORBID_EXTENSION_PATTERN,
            "/*/*" + FORBID_EXTENSION_PATTERN,
            TRAILING_DIR_PATTERN,
            "/*" + TRAILING_DIR_PATTERN,
            "/*/*" + TRAILING_DIR_PATTERN,
            "/*/*/*/*/{*remaining}",
        }
    )
    public String forward() {
        return "forward:/";
    }
}
