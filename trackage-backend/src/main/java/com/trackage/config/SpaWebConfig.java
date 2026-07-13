package com.trackage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Serves the React build (bundled into src/main/resources/static at build time) and
 * falls back to index.html for client-side routes (e.g. /groups/5) that aren't real
 * static files, so browser refreshes and deep links work. Requests under the API
 * prefixes are excluded so a genuinely missing API route still 404s instead of
 * silently returning the SPA shell.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        if (resourcePath.startsWith("trackage/") || resourcePath.startsWith("v3/")
                                || resourcePath.startsWith("swagger-ui")) {
                            return null;
                        }
                        Resource requested = location.createRelative(resourcePath);
                        return requested.exists() && requested.isReadable()
                                ? requested
                                : new ClassPathResource("/static/index.html");
                    }
                });
    }
}
