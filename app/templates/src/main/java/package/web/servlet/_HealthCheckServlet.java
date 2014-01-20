package <%=packageName%>.web.servlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class HealthCheckServlet extends com.codahale.metrics.servlets.HealthCheckServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    super.doGet(req, resp);

    // Overrides the default behaviour. We don't want to return 500 Internal Service Error if one or more fail.
    // This count has an error 500, which is not the case.
    //
    // HealthCheckServlet responds to GET requests by running all the [health checks](#health-checks)
    // and returning 501 Not Implemented if no health checks are registered, 200 OK if all pass,
    // or 500 Internal Service Error if one or more fail.
    resp.setStatus(HttpServletResponse.SC_OK);
  }

}
