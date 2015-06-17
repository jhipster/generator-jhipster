package <%=packageName%>.config.cassandra;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.datastax.driver.core.*;
import com.datastax.driver.core.policies.LatencyAwarePolicy;
import com.datastax.driver.core.policies.LatencyAwarePolicy.Builder;
import com.datastax.driver.core.policies.LoadBalancingPolicy;
import com.datastax.driver.core.policies.ReconnectionPolicy;
import com.datastax.driver.core.policies.RetryPolicy;
import com.google.common.collect.Lists;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.ClassUtils;
import org.springframework.util.StringUtils;

/**
 * Configuration properties for Cassandra.
 */
@ConfigurationProperties(prefix = "spring.data.cassandra")
public class CassandraProperties {

    private static final Log log = LogFactory.getLog(CassandraProperties.class);

    /**
     * Name of the Cassandra cluster.
     */
    private String clusterName = "Test Cluster";

    private int port = ProtocolOptions.DEFAULT_PORT;

    /**
     * Comma-separated list of cluster node addresses.
     */
    private String contactPoints = "localhost";

    /**
     * Protocol version supported by the Cassandra binary protocol: can be V1, V2, V3.
     */
    private String protocolVersion;

    /**
     * Compression supported by the Cassandra binary protocol: can be NONE, SNAPPY, LZ4.
     */
    private String compression = ProtocolOptions.Compression.NONE.name();

    /**
     * Class name of the load balancing policy.
     */
    private String loadBalancingPolicy;

    /**
     * Queries consistency level.
     */
    private String consistency;

    /**
     * Queries serial consistency level.
     */
    private String serialConsistency;

    /**
     * Queries default fetch size.
     */
    private int fetchSize = QueryOptions.DEFAULT_FETCH_SIZE;

    /**
     * Class name of the reconnection policy.
     */
    private String reconnectionPolicy;

    /**
     * Class name of the retry policy.
     */
    private String retryPolicy;

    /**
     * Socket option: connection time out.
     */
    private int connectTimeoutMillis = SocketOptions.DEFAULT_CONNECT_TIMEOUT_MILLIS;

    /**
     * Socket option: read time out.
     */
    private int readTimeoutMillis = SocketOptions.DEFAULT_READ_TIMEOUT_MILLIS;

    /**
     * Enable SSL support.
     */
    private boolean ssl = false;

    /**
     * Keyspace name to use.
     */
    private String keyspaceName;


    /**
     * User in case authentication is needed.
     */
    private String user = "";

    /**
     * password in case authentication is needed.
     */
    private String password = "";

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getContactPoints() {
        return contactPoints;
    }

    public void setContactPoints(String contactPoints) {
        this.contactPoints = contactPoints;
    }

    public String getProtocolVersion() {
        return protocolVersion;
    }

    public void setProtocolVersion(String protocolVersion) {
        this.protocolVersion = protocolVersion;
    }

    public String getCompression() {
        return compression;
    }

    public void setCompression(String compression) {
        this.compression = compression;
    }

    public String getLoadBalancingPolicy() {
        return loadBalancingPolicy;
    }

    public void setLoadBalancingPolicy(String loadBalancingPolicy) {
        this.loadBalancingPolicy = loadBalancingPolicy;
    }

    public String getConsistency() {
        return consistency;
    }

    public void setConsistency(String consistency) {
        this.consistency = consistency;
    }

    public String getSerialConsistency() {
        return serialConsistency;
    }

    public void setSerialConsistency(String serialConsistency) {
        this.serialConsistency = serialConsistency;
    }

    public int getFetchSize() {
        return fetchSize;
    }

    public void setFetchSize(int fetchSize) {
        this.fetchSize = fetchSize;
    }

    public String getReconnectionPolicy() {
        return reconnectionPolicy;
    }

    public void setReconnectionPolicy(String reconnectionPolicy) {
        this.reconnectionPolicy = reconnectionPolicy;
    }

    public String getRetryPolicy() {
        return retryPolicy;
    }

    public void setRetryPolicy(String retryPolicy) {
        this.retryPolicy = retryPolicy;
    }

    public int getConnectTimeoutMillis() {
        return connectTimeoutMillis;
    }

    public void setConnectTimeoutMillis(int connectTimeoutMillis) {
        this.connectTimeoutMillis = connectTimeoutMillis;
    }

    public int getReadTimeoutMillis() {
        return readTimeoutMillis;
    }

    public void setReadTimeoutMillis(int readTimeoutMillis) {
        this.readTimeoutMillis = readTimeoutMillis;
    }

    public boolean isSsl() {
        return ssl;
    }

    public void setSsl(boolean ssl) {
        this.ssl = ssl;
    }

    public String getKeyspaceName() {
        return keyspaceName;
    }

    public void setKeyspaceName(String keyspaceName) {
        this.keyspaceName = keyspaceName;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Parse the load balancing policy.
     */
    public static LoadBalancingPolicy parseLbPolicy(String loadBalancingPolicyString) throws InstantiationException,
        IllegalAccessException, ClassNotFoundException, NoSuchMethodException, SecurityException,
        IllegalArgumentException, InvocationTargetException {
        String lb_regex = "([a-zA-Z]*Policy)(\\()(.*)(\\))";
        Pattern lb_pattern = Pattern.compile(lb_regex);
        if (!loadBalancingPolicyString.contains("(")) {
            loadBalancingPolicyString += "()";
        }
        Matcher lb_matcher = lb_pattern.matcher(loadBalancingPolicyString);

        if (lb_matcher.matches()) {
            if (lb_matcher.groupCount() > 0) {
                // Primary LB policy has been specified
                String primaryLoadBalancingPolicy = lb_matcher.group(1);
                String loadBalancingPolicyParams = lb_matcher.group(3);
                return getLbPolicy(primaryLoadBalancingPolicy, loadBalancingPolicyParams);
            }
        }
        return null;
    }

    /**
     * Get the load balancing policy.
     */
    public static LoadBalancingPolicy getLbPolicy(String lbString, String parameters) throws ClassNotFoundException,
        NoSuchMethodException, SecurityException, InstantiationException, IllegalAccessException,
        IllegalArgumentException, InvocationTargetException {
        LoadBalancingPolicy policy = null;
        if (!lbString.contains(".")) {
            lbString = "com.datastax.driver.core.policies." + lbString;
        }

        if (parameters.length() > 0) {
            // Child policy or parameters have been specified
            String paramsRegex = "([^,]+\\(.+?\\))|([^,]+)";
            Pattern param_pattern = Pattern.compile(paramsRegex);
            Matcher lb_matcher = param_pattern.matcher(parameters);

            ArrayList<Object> paramList = Lists.newArrayList();
            ArrayList<Class> primaryParametersClasses = Lists.newArrayList();
            int nb = 0;
            while (lb_matcher.find()) {
                if (lb_matcher.groupCount() > 0) {
                    try {
                        if (lb_matcher.group().contains("(") && !lb_matcher.group().trim().startsWith("(")) {
                            // We are dealing with child policies here
                            primaryParametersClasses.add(LoadBalancingPolicy.class);
                            // Parse and add child policy to the parameter list
                            paramList.add(parseLbPolicy(lb_matcher.group()));
                            nb++;
                        } else {
                            // We are dealing with parameters that are not policies here
                            String param = lb_matcher.group();
                            if (param.contains("'") || param.contains("\"")) {
                                primaryParametersClasses.add(String.class);
                                paramList.add(new String(param.trim().replace("'", "").replace("\"", "")));
                            } else if (param.contains(".") || param.toLowerCase().contains("(double)") || param
                                .toLowerCase().contains("(float)")) {
                                // gotta allow using float or double
                                if (param.toLowerCase().contains("(double)")) {
                                    primaryParametersClasses.add(double.class);
                                    paramList.add(Double.parseDouble(param.replace("(double)", "").trim()));
                                } else {
                                    primaryParametersClasses.add(float.class);
                                    paramList.add(Float.parseFloat(param.replace("(float)", "").trim()));
                                }
                            } else {
                                if (param.toLowerCase().contains("(long)")) {
                                    primaryParametersClasses.add(long.class);
                                    paramList.add(Long.parseLong(param.toLowerCase().replace("(long)", "").trim()));
                                } else {
                                    primaryParametersClasses.add(int.class);
                                    paramList.add(Integer.parseInt(param.toLowerCase().replace("(int)", "").trim()));
                                }
                            }
                            nb++;
                        }
                    } catch (Exception e) {
                        log.error("Could not parse the Cassandra load balancing policy! " + e.getMessage());
                    }
                }
            }
            if (nb > 0) {
                // Instantiate load balancing policy with parameters
                if (lbString.toLowerCase().contains("latencyawarepolicy")) {
                    //special sauce for the latency aware policy which uses a builder subclass to instantiate
                    Builder builder = LatencyAwarePolicy.builder((LoadBalancingPolicy) paramList.get(0));

                    builder.withExclusionThreshold((Double) paramList.get(1));
                    builder.withScale((Long) paramList.get(2), TimeUnit.MILLISECONDS);
                    builder.withRetryPeriod((Long) paramList.get(3), TimeUnit.MILLISECONDS);
                    builder.withUpdateRate((Long) paramList.get(4), TimeUnit.MILLISECONDS);
                    builder.withMininumMeasurements((Integer) paramList.get(5));

                    return builder.build();

                } else {
                    Class<?> clazz = Class.forName(lbString);
                    Constructor<?> constructor = clazz.getConstructor(primaryParametersClasses.toArray(new
                        Class[primaryParametersClasses.size()]));

                    return (LoadBalancingPolicy) constructor.newInstance(paramList.toArray(new Object[paramList.size
                        ()]));
                }
            } else {
                // Only one policy has been specified, with no parameter or child policy
                Class<?> clazz = Class.forName(lbString);
                policy = (LoadBalancingPolicy) clazz.newInstance();
                return policy;
            }
        } else {
            // Only one policy has been specified, with no parameter or child policy
            Class<?> clazz = Class.forName(lbString);
            policy = (LoadBalancingPolicy) clazz.newInstance();
            return policy;
        }
    }

    /**
     * Parse the RetryPolicy policy.
     */
    public static RetryPolicy parseRetryPolicy(String retryPolicyString) throws InstantiationException,
        IllegalAccessException, ClassNotFoundException, NoSuchMethodException, SecurityException,
        IllegalArgumentException, InvocationTargetException, NoSuchFieldException {

        if (!retryPolicyString.contains(".")) {
            retryPolicyString = "com.datastax.driver.core.policies." + retryPolicyString;
            Class<?> clazz = Class.forName(retryPolicyString);
            Field field = clazz.getDeclaredField("INSTANCE");
            RetryPolicy policy = (RetryPolicy) field.get(null);
            return policy;
        }
        return null;
    }

    /**
     * Parse the reconnection policy.
     */
    public static ReconnectionPolicy parseReconnectionPolicy(String reconnectionPolicyString) throws
        InstantiationException, IllegalAccessException, ClassNotFoundException, NoSuchMethodException,
        SecurityException, IllegalArgumentException, InvocationTargetException {
        String lb_regex = "([a-zA-Z]*Policy)(\\()(.*)(\\))";
        Pattern lb_pattern = Pattern.compile(lb_regex);
        Matcher lb_matcher = lb_pattern.matcher(reconnectionPolicyString);
        if (lb_matcher.matches()) {
            if (lb_matcher.groupCount() > 0) {
                // Primary LB policy has been specified
                String primaryReconnectionPolicy = lb_matcher.group(1);
                String reconnectionPolicyParams = lb_matcher.group(3);
                return getReconnectionPolicy(primaryReconnectionPolicy, reconnectionPolicyParams);
            }
        }
        return null;
    }

    /**
     * Get the reconnection policy.
     */
    public static ReconnectionPolicy getReconnectionPolicy(String rcString, String parameters) throws
        ClassNotFoundException, NoSuchMethodException, SecurityException, InstantiationException,
        IllegalAccessException, IllegalArgumentException, InvocationTargetException {
        ReconnectionPolicy policy = null;
        //ReconnectionPolicy childPolicy = null;
        if (!rcString.contains(".")) {
            rcString = "com.datastax.driver.core.policies." + rcString;
        }

        if (parameters.length() > 0) {
            // Child policy or parameters have been specified
            String paramsRegex = "([^,]+\\(.+?\\))|([^,]+)";
            Pattern param_pattern = Pattern.compile(paramsRegex);
            Matcher lb_matcher = param_pattern.matcher(parameters);

            ArrayList<Object> paramList = Lists.newArrayList();
            ArrayList<Class> primaryParametersClasses = Lists.newArrayList();
            int nb = 0;
            while (lb_matcher.find()) {
                if (lb_matcher.groupCount() > 0) {
                    try {
                        if (lb_matcher.group().contains("(") && !lb_matcher.group().trim().startsWith("(")) {
                            // We are dealing with child policies here
                            primaryParametersClasses.add(LoadBalancingPolicy.class);
                            // Parse and add child policy to the parameter list
                            paramList.add(parseReconnectionPolicy(lb_matcher.group()));
                            nb++;
                        } else {
                            // We are dealing with parameters that are not policies here
                            String param = lb_matcher.group();
                            if (param.contains("'") || param.contains("\"")) {
                                primaryParametersClasses.add(String.class);
                                paramList.add(new String(param.trim().replace("'", "").replace("\"", "")));
                            } else if (param.contains(".") || param.toLowerCase().contains("(double)") || param
                                .toLowerCase().contains("(float)")) {
                                // gotta allow using float or double
                                if (param.toLowerCase().contains("(double)")) {
                                    primaryParametersClasses.add(double.class);
                                    paramList.add(Double.parseDouble(param.replace("(double)", "").trim()));
                                } else {
                                    primaryParametersClasses.add(float.class);
                                    paramList.add(Float.parseFloat(param.replace("(float)", "").trim()));
                                }
                            } else {
                                if (param.toLowerCase().contains("(long)")) {
                                    primaryParametersClasses.add(long.class);
                                    paramList.add(Long.parseLong(param.toLowerCase().replace("(long)", "").trim()));
                                } else {
                                    primaryParametersClasses.add(int.class);
                                    paramList.add(Integer.parseInt(param.toLowerCase().replace("(int)", "").trim()));
                                }
                            }
                            nb++;
                        }
                    } catch (Exception e) {
                        log.error("Could not parse the Cassandra reconnection policy! " + e.getMessage());
                    }
                }
            }

            if (nb > 0) {
                // Instantiate load balancing policy with parameters
                Class<?> clazz = Class.forName(rcString);
                Constructor<?> constructor = clazz.getConstructor(primaryParametersClasses.toArray(new
                    Class[primaryParametersClasses.size()]));

                return (ReconnectionPolicy) constructor.newInstance(paramList.toArray(new Object[paramList.size()]));
            }
            // Only one policy has been specified, with no parameter or child policy
            Class<?> clazz = Class.forName(rcString);
            policy = (ReconnectionPolicy) clazz.newInstance();
            return policy;
        }
        Class<?> clazz = Class.forName(rcString);
        policy = (ReconnectionPolicy) clazz.newInstance();
        return policy;
    }

    public Cluster createCluster() {
        Cluster.Builder builder = Cluster.builder()
            .withClusterName(this.getClusterName())
            .withPort(this.getPort());

        if (ProtocolVersion.V1.name().equals(this.getProtocolVersion())) {
            builder.withProtocolVersion(ProtocolVersion.V1);
        } else if (ProtocolVersion.V2.name().equals(this.getProtocolVersion())) {
            builder.withProtocolVersion(ProtocolVersion.V2);
        } else if (ProtocolVersion.V3.name().equals(this.getProtocolVersion())) {
            builder.withProtocolVersion(ProtocolVersion.V3);
        }

        // Manage compression protocol
        if (ProtocolOptions.Compression.SNAPPY.name().equals(this.getCompression())) {
            builder.withCompression(ProtocolOptions.Compression.SNAPPY);
        } else if (ProtocolOptions.Compression.LZ4.name().equals(this.getCompression())) {
            builder.withCompression(ProtocolOptions.Compression.LZ4);
        } else {
            builder.withCompression(ProtocolOptions.Compression.NONE);
        }

        // Manage the load balancing policy
        if (!StringUtils.isEmpty(this.getLoadBalancingPolicy())) {
            try {
                builder.withLoadBalancingPolicy(parseLbPolicy(this.getLoadBalancingPolicy()));
            } catch (ClassNotFoundException e) {
                log.warn("The load balancing policy could not be loaded, falling back to the default policy", e);
            } catch (InstantiationException e) {
                log.warn("The load balancing policy could not be instanced, falling back to the default policy", e);
            } catch (IllegalAccessException e) {
                log.warn("The load balancing policy could not be created, falling back to the default policy", e);
            } catch (ClassCastException e) {
                log.warn("The load balancing policy does not implement the correct interface, falling back to the " +
                    "default policy", e);
            } catch (NoSuchMethodException e) {
                log.warn("The load balancing policy could not be created, falling back to the default policy", e);
            } catch (SecurityException e) {
                log.warn("The load balancing policy could not be created, falling back to the default policy", e);
            } catch (IllegalArgumentException e) {
                log.warn("The load balancing policy could not be created, falling back to the default policy", e);
            } catch (InvocationTargetException e) {
                log.warn("The load balancing policy could not be created, falling back to the default policy", e);
            }
        }

        // Manage query options
        QueryOptions queryOptions = new QueryOptions();
        if (this.getConsistency() != null) {
            ConsistencyLevel consistencyLevel = ConsistencyLevel.valueOf(this.getConsistency());
            queryOptions.setConsistencyLevel(consistencyLevel);
        }
        if (this.getSerialConsistency() != null) {
            ConsistencyLevel serialConsistencyLevel = ConsistencyLevel.valueOf(this.getSerialConsistency());
            queryOptions.setSerialConsistencyLevel(serialConsistencyLevel);
        }
        queryOptions.setFetchSize(this.getFetchSize());
        builder.withQueryOptions(queryOptions);

        // Manage the reconnection policy
        if (!StringUtils.isEmpty(this.getReconnectionPolicy())) {
            try {
                builder.withReconnectionPolicy(parseReconnectionPolicy(this.getReconnectionPolicy()));
            } catch (ClassNotFoundException e) {
                log.warn("The reconnection policy could not be loaded, falling back to the default policy", e);
            } catch (InstantiationException e) {
                log.warn("The reconnection policy could not be instanced, falling back to the default policy", e);
            } catch (IllegalAccessException e) {
                log.warn("The reconnection policy could not be created, falling back to the default policy", e);
            } catch (ClassCastException e) {
                log.warn("The reconnection policy does not implement the correct interface, falling back to the " +
                    "default policy", e);
            } catch (NoSuchMethodException e) {
                log.warn("The reconnection policy could not be created, falling back to the default policy", e);
            } catch (SecurityException e) {
                log.warn("The reconnection policy could not be created, falling back to the default policy", e);
            } catch (IllegalArgumentException e) {
                log.warn("The reconnection policy could not be created, falling back to the default policy", e);
            } catch (InvocationTargetException e) {
                log.warn("The reconnection policy could not be created, falling back to the default policy", e);
            }
        }

        // Manage the retry policy
        if (!StringUtils.isEmpty(this.getRetryPolicy())) {
            try {
                builder.withRetryPolicy(parseRetryPolicy(this.getRetryPolicy()));
            } catch (ClassNotFoundException e) {
                log.warn("The retry policy could not be loaded, falling back to the default policy", e);
            } catch (InstantiationException e) {
                log.warn("The retry policy could not be instanced, falling back to the default policy", e);
            } catch (IllegalAccessException e) {
                log.warn("The retry policy could not be created, falling back to the default policy", e);
            } catch (ClassCastException e) {
                log.warn("The retry policy does not implement the correct interface, falling back to the default " +
                    "policy", e);
            } catch (NoSuchMethodException e) {
                log.warn("The retry policy could not be created, falling back to the default policy", e);
            } catch (SecurityException e) {
                log.warn("The retry policy could not be created, falling back to the default policy", e);
            } catch (IllegalArgumentException e) {
                log.warn("The retry policy could not be created, falling back to the default policy", e);
            } catch (InvocationTargetException e) {
                log.warn("The retry policy could not be created, falling back to the default policy", e);
            } catch (NoSuchFieldException e) {
                log.warn("The retry policy could not be created, falling back to the default policy", e);
            }
        }

        if (!StringUtils.isEmpty(this.getUser()) && !StringUtils.isEmpty(this.getPassword())) {
            builder.withCredentials(this.getUser(), this.getPassword());
        }

        // Manage socket options
        SocketOptions socketOptions = new SocketOptions();
        socketOptions.setConnectTimeoutMillis(this.getConnectTimeoutMillis());
        socketOptions.setReadTimeoutMillis(this.getReadTimeoutMillis());
        builder.withSocketOptions(socketOptions);

        // Manage SSL
        if (this.isSsl()) {
            builder.withSSL();
        }

        // Manage the contact points
        builder.addContactPoints(StringUtils.commaDelimitedListToStringArray(this.getContactPoints()));

        return builder.build();
    }
}
