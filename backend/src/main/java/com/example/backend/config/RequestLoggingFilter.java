package com.example.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Slf4j
@Component
public class RequestLoggingFilter implements Filter {

  @Override
  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest request = (HttpServletRequest) req;
    HttpServletResponse response = (HttpServletResponse) res;

    long start = System.currentTimeMillis();
    chain.doFilter(req, res);
    long duration = System.currentTimeMillis() - start;

    log.info("{} {} -> {} ({}ms)",
        request.getMethod(),
        request.getRequestURI(),
        response.getStatus(),
        duration);
  }
}
