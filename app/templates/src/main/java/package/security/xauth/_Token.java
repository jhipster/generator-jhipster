package <%=packageName%>.security.xauth;

/**
 * Created by jboulay on 21/12/14.
 */
public class Token {

    String token;
    long expires;

    public Token(String token, long expires){
        this.token = token;
        this.expires = expires;
    }

    public String getToken() {
        return token;
    }

    public long getExpires() {
        return expires;
    }
}
