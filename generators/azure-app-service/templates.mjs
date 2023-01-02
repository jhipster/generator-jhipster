// eslint-disable-next-line import/prefer-default-export
export const mavenPluginConfiguration = data => `
                <configuration>
                    <schemaVersion>V2</schemaVersion>
                    <resourceGroup>${data.azureAppServiceResourceGroupName}</resourceGroup>
                    <appName>${data.azureAppServiceName}</appName>
                    <deployment>
                        <resources>
                            <resource>
                            <directory>\${project.basedir}/target</directory>
                            <includes>
                                <include>*.jar</include>
                            </includes>
                            </resource>
                        </resources>
                    </deployment>
                </configuration>`;
