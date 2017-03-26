package <%=packageName%>.web.rest.errors;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * View Model for sending a parameterized error message.
 */
public class ParameterizedErrorVM implements Serializable {

    private static final long serialVersionUID = 1L;

    private static final String PARAMS = "params";

    private final String message;
    private Map<String, String> paramMap;

    public ParameterizedErrorVM(String message, Map<String, String> paramMap) {
        this.message = message;
        this.paramMap = paramMap;
    }

    public ParameterizedErrorVM(String message, String... params) {
        this.message = message;
        if (params != null && params.length > 0) {
            paramMap = new HashMap<>();
            for (int i = 0; i < params.length; i++) {
                paramMap.put(PARAMS + i, params[i]);
            }
        }
    }

    public String getMessage() {
        return message;
    }

    public Map<String, String> getParams() {
        return paramMap;
    }

}
