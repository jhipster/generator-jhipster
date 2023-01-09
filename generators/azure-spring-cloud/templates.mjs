// eslint-disable-next-line import/prefer-default-export
export const mavenProfile = () => `            <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-undertow</artifactId>
            </dependency>
            <dependency>
                <groupId>com.microsoft.azure</groupId>
                <artifactId>spring-cloud-starter-azure-spring-cloud-client</artifactId>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-config</artifactId>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-zipkin</artifactId>
            </dependency>
        </dependencies>
        <properties>
            <!-- default Spring profiles -->
            <spring.profiles.active>prod,azure\${profile.api-docs}</spring.profiles.active>
        </properties>`;
