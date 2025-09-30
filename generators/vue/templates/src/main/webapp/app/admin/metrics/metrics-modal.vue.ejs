<template>
  <div class="modal-body">
    <span class="badge bg-primary" @click="threadDumpFilter = ''"
      >All&nbsp;<span class="badge rounded-pill bg-default">{{ threadDumpData.threadDumpAll }}</span></span
    >&nbsp;
    <span class="badge bg-success" @click="threadDumpFilter = 'RUNNABLE'"
      >Runnable&nbsp;<span class="badge rounded-pill bg-default">{{ threadDumpData.threadDumpRunnable }}</span></span
    >&nbsp;
    <span class="badge bg-info" @click="threadDumpFilter = 'WAITING'"
      >Waiting&nbsp;<span class="badge rounded-pill bg-default">{{ threadDumpData.threadDumpWaiting }}</span></span
    >&nbsp;
    <span class="badge bg-warning" @click="threadDumpFilter = 'TIMED_WAITING'"
      >Timed Waiting&nbsp;<span class="badge rounded-pill bg-default">{{ threadDumpData.threadDumpTimedWaiting }}</span></span
    >&nbsp;
    <span class="badge bg-danger" @click="threadDumpFilter = 'BLOCKED'"
      >Blocked&nbsp;<span class="badge rounded-pill bg-default">{{ threadDumpData.threadDumpBlocked }}</span></span
    >&nbsp;
    <div class="mt-2">&nbsp;</div>
    Filter
    <input type="text" v-model="threadDumpFilter" class="form-control" />
    <div class="pad" v-for="(entry, key1) of filteredThreadDump" :key="key1">
      <h6>
        <span class="badge" :class="getBadgeClass(entry.threadState)">{{ entry.threadState }}</span
        >&nbsp;{{ entry.threadName }} (ID {{ entry.threadId }})
        <a @click="entry.show = !entry.show" href="javascript:void(0);">
          <span :hidden="entry.show">{{ t$('metrics.jvm.threads.dump.show') }}</span>
          <span :hidden="!entry.show">{{ t$('metrics.jvm.threads.dump.hide') }}</span>
        </a>
      </h6>
      <div class="card" :hidden="!entry.show">
        <div class="card-body">
          <div v-for="(st, key2) of entry.stackTrace" :key="key2" class="break">
            <samp
              >{{ st.className }}.{{ st.methodName }}(<code>{{ st.fileName }}:{{ st.lineNumber }}</code
              >)</samp
            >
            <span class="mt-1"></span>
          </div>
        </div>
      </div>
      <table class="table table-sm table-responsive" aria-describedby="Metrics">
        <thead>
          <tr>
            <th scope="col">{{ t$('metrics.jvm.threads.dump.blockedtime') }}</th>
            <th scope="col">{{ t$('metrics.jvm.threads.dump.blockedcount') }}</th>
            <th scope="col">{{ t$('metrics.jvm.threads.dump.waitedtime') }}</th>
            <th scope="col">{{ t$('metrics.jvm.threads.dump.waitedcount') }}</th>
            <th scope="col">{{ t$('metrics.jvm.threads.dump.lockname') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ entry.blockedTime }}</td>
            <td>{{ entry.blockedCount }}</td>
            <td>{{ entry.waitedTime }}</td>
            <td>{{ entry.waitedCount }}</td>
            <td class="thread-dump-modal-lock" :title="entry.lockName">
              <code>{{ entry.lockName }}</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" src="./metrics-modal.component.ts"></script>
