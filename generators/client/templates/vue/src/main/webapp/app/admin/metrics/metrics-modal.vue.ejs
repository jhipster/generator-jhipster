<template>
    <div class="modal-body">
        <span class="badge badge-primary" v-on:click="threadDumpFilter = ''">All&nbsp;<span class="badge badge-pill badge-default">{{threadDumpData.threadDumpAll}}</span></span>&nbsp;
        <span class="badge badge-success" v-on:click="threadDumpFilter = 'RUNNABLE'">Runnable&nbsp;<span class="badge badge-pill badge-default">{{threadDumpData.threadDumpRunnable}}</span></span>&nbsp;
        <span class="badge badge-info" v-on:click="threadDumpFilter = 'WAITING'">Waiting&nbsp;<span class="badge badge-pill badge-default">{{threadDumpData.threadDumpWaiting}}</span></span>&nbsp;
        <span class="badge badge-warning" v-on:click="threadDumpFilter = 'TIMED_WAITING'">Timed Waiting&nbsp;<span class="badge badge-pill badge-default">{{threadDumpData.threadDumpTimedWaiting}}</span></span>&nbsp;
        <span class="badge badge-danger" v-on:click="threadDumpFilter = 'BLOCKED'">Blocked&nbsp;<span class="badge badge-pill badge-default">{{threadDumpData.threadDumpBlocked}}</span></span>&nbsp;
        <div class="mt-2">&nbsp;</div>
        Filter
        <input type="text" v-model="threadDumpFilter" class="form-control">
        <div class="pad" v-for="(entry, key) of filterBy(threadDump, threadDumpFilter)">
            <h6>
                <span class="badge" :class="getBadgeClass(entry.threadState)">{{entry.threadState}}</span>&nbsp;{{entry.threadName}} (ID {{entry.threadId}})
                <a v-on:click="entry.show = !entry.show" href="javascript:void(0);">
                    <span :hidden="entry.show" v-text="$t('metrics.jvm.threads.dump.show')">Show StackTrace</span>
                    <span :hidden="!entry.show" v-text="$t('metrics.jvm.threads.dump.hide')">Hide StackTrace</span>
                </a>
            </h6>
            <div class="card" :hidden="!entry.show">
                <div class="card-body">
                    <div v-for="(st, key) of entry.stackTrace" class="break">
                        <samp>{{st.className}}.{{st.methodName}}(<code>{{st.fileName}}:{{st.lineNumber}}</code>)</samp>
                        <span class="mt-1"></span>
                    </div>
                </div>
            </div>
            <table class="table table-sm table-responsive">
                <thead>
                <tr>
                    <th v-text="$t('metrics.jvm.threads.dump.blockedtime')">Blocked Time</th>
                    <th v-text="$t('metrics.jvm.threads.dump.blockedcount')">Blocked Count</th>
                    <th v-text="$t('metrics.jvm.threads.dump.waitedtime')">Waited Time</th>
                    <th v-text="$t('metrics.jvm.threads.dump.waitedcount')">Waited Count</th>
                    <th v-text="$t('metrics.jvm.threads.dump.lockname')">Lock Name</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{{entry.blockedTime}}</td>
                    <td>{{entry.blockedCount}}</td>
                    <td>{{entry.waitedTime}}</td>
                    <td>{{entry.waitedCount}}</td>
                    <td class="thread-dump-modal-lock" :title="entry.lockName"><code>{{entry.lockName}}</code></td>
                </tr>
                </tbody>
            </table>

        </div>
    </div>
</template>

<script lang="ts" src="./metrics-modal.component.ts">
</script>
