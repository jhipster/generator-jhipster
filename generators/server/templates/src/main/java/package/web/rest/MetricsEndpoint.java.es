<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.web.rest;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.micrometer.core.instrument.FunctionCounter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.MeterRegistry.Config;
import io.micrometer.core.instrument.distribution.ValueAtPercentile;
import io.micrometer.core.instrument.search.Search;
import io.micrometer.prometheus.PrometheusMeterRegistry;

@RestController
@RequestMapping("/management")
public class AllMetricsEndpoint {

    @Autowired
    MeterRegistry meterRegistry;

    @Autowired
    PrometheusMeterRegistry prometheusMeterRegistry;

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    @GetMapping("/micrometer-metrics")
    public Map<String, Map> getMetrics() {

        Map<String, Map> results = new HashMap<>();

        // JVM stats

        Map<String, Map<String, Number>> resultsJVM = new HashMap<>();

        Search jvmUsedSearch = Search.in(this.meterRegistry).name(s -> s.contains("jvm.memory.used"));

        Collection<Gauge> gauges = jvmUsedSearch.gauges();

        gauges.forEach(gauge -> {
          String key = gauge.getId().getTag("id");

          resultsJVM.putIfAbsent(key, new HashMap<>());

          resultsJVM.get(key).put("used", gauge.value());

        });

        Search jvmMaxSearch = Search.in(this.meterRegistry).name(s -> s.contains("jvm.memory.max"));

        gauges = jvmMaxSearch.gauges();

        gauges.forEach(gauge -> {
          String key = gauge.getId().getTag("id");
          resultsJVM.get(key).put("max", gauge.value());

        });

        Search jvmCommittedSearch = Search.in(this.meterRegistry).name(s -> s.contains("jvm.memory.committed"));

        gauges = jvmCommittedSearch.gauges();

        gauges.forEach(gauge -> {
          String key = gauge.getId().getTag("id");
          resultsJVM.get(key).put("committed", gauge.value());

        });

        results.put("jvm", resultsJVM);

        // HTTP requests stats
        List<String> statusCode = new ArrayList<>();
        statusCode.add("200");
        statusCode.add("404");
        statusCode.add("500");

        Map<String, Map<String, Number>> resultsHTTP = new HashMap<>();

        statusCode.forEach(code -> {
            Map<String, Number> resultsHTTPPerCode = new HashMap<>();

            Collection<Timer> httpTimersStream = this.prometheusMeterRegistry.find("http.server.requests").tag("status", code).timers();

            if (!httpTimersStream.isEmpty()) {
                long count = httpTimersStream.stream().map(x -> x.count()).reduce((x,y) -> x+y).get();
                double max = httpTimersStream.stream().map(x -> x.max(TimeUnit.MILLISECONDS)).reduce((x,y) -> x>y ? x : y).get();
                double totalTime = httpTimersStream.stream().map(x -> x.totalTime(TimeUnit.MILLISECONDS)).reduce((x,y) -> (x +y)).get();

                resultsHTTPPerCode.put("count", count);
                resultsHTTPPerCode.put("max", max);
                resultsHTTPPerCode.put("mean", totalTime/count);
                resultsHTTP.put(code, resultsHTTPPerCode);
            } else {
                resultsHTTPPerCode.put("count", 0);
                resultsHTTPPerCode.put("max", 0);
                resultsHTTPPerCode.put("mean", 0);

                resultsHTTP.put(code, resultsHTTPPerCode);
            }
        });

        Collection<Timer> timers = this.prometheusMeterRegistry.find("http.server.requests").timers();
        long countAllrequests = timers.stream().map(x -> x.count()).reduce((x,y) -> x+y).get();
        Map<String, Number> resultsHTTPAll = new HashMap<>();
        resultsHTTPAll.put("count", countAllrequests);

        results.put("http.server.requests.all", resultsHTTPAll);


        results.put("http.server.requests", resultsHTTP);

        // Cache stats
        Map<String, Map<String, Number>> resultsCache = new HashMap<>();

        Collection<FunctionCounter> counters = Search.in(this.meterRegistry).name(s -> s.contains("cache")).functionCounters();

        counters.forEach(counter -> {
            String name = counter.getId().getTag("name");

            resultsCache.putIfAbsent(name, new HashMap<>());

            String key = counter.getId().getName();
            if (counter.getId().getTag("result") != null) {
                key += "." + counter.getId().getTag("result");
            }

            resultsCache.get(name).put(key, counter.count());
        });

        gauges = Search.in(this.meterRegistry).name(s -> s.contains("cache")).gauges();

        gauges.forEach(gauge -> {
            String name = gauge.getId().getTag("name");

            resultsCache.putIfAbsent(name, new HashMap<>());

            String key = gauge.getId().getName();

            resultsCache.get(name).put(key, gauge.value());
        });

        results.put("cache", resultsCache);

        // Service stats
        Map<String, Map<String, Number>> resultsService = new HashMap<>();

        timers = Search.in(this.meterRegistry).tagKeys("service").timers();

        timers.forEach(timer -> {
            String key = timer.getId().getName();

            resultsService.putIfAbsent(key, new HashMap<>());

            resultsService.get(key).put("count", timer.count());
            resultsService.get(key).put("max", timer.max(TimeUnit.MILLISECONDS));
            resultsService.get(key).put("totalTime", timer.totalTime(TimeUnit.MILLISECONDS));
            resultsService.get(key).put("mean", timer.mean(TimeUnit.MILLISECONDS));

            ValueAtPercentile[] percentiles = timer.takeSnapshot().percentileValues();

            for(int i = 0; i< percentiles.length; i++){
                resultsService.get(key).put(String.valueOf(percentiles[i].percentile()), percentiles[i].value());
            }
        });

        results.put("services", resultsService);

        // Database stats
        Map<String, Map<String, Number>> resultsDatabase = new HashMap<>();
        timers = Search.in(this.meterRegistry).name(s -> s.contains("hikari")).timers();

        timers.forEach(timer -> {
            String key = timer.getId().getName().substring(timer.getId().getName().lastIndexOf(".") + 1);

            resultsDatabase.putIfAbsent(key, new HashMap<>());

            resultsDatabase.get(key).put("count", timer.count());
            resultsDatabase.get(key).put("max", timer.max(TimeUnit.MILLISECONDS));
            resultsDatabase.get(key).put("totalTime", timer.totalTime(TimeUnit.MILLISECONDS));
            resultsDatabase.get(key).put("mean", timer.mean(TimeUnit.MILLISECONDS));

            ValueAtPercentile[] percentiles = timer.takeSnapshot().percentileValues();

            for(int i = 0; i< percentiles.length; i++){
                resultsDatabase.get(key).put(String.valueOf(percentiles[i].percentile()), percentiles[i].value());
            }
        });

        results.put("databases", resultsDatabase);

        gauges = Search.in(this.meterRegistry).name(s -> s.contains("hikari")).gauges();

        gauges.forEach(gauge -> {
            String key = gauge.getId().getName().substring(gauge.getId().getName().lastIndexOf(".") + 1);

            resultsDatabase.putIfAbsent(key, new HashMap<>());

            resultsDatabase.get(key).put("value", gauge.value());

        });

        results.put("databases", resultsDatabase);

        return results;
    }

}
