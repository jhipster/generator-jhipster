<template>
    <div class="table-responsive">
        <h2 id="logs-page-heading" v-text="$t('logs.title')">Logs</h2>

        <div v-if="loggers">
            <p v-text="$t('logs.nbloggers', { 'total': loggers.length})">There are {{ loggers.length }} loggers.</p>

            <span v-text="$t('logs.filter')">Filter</span> <input type="text" v-model="filtered" class="form-control">

            <table class="table table-sm table-striped table-bordered">
                <thead>
                <tr title="click to order">
                    <th v-on:click="changeOrder('name')"><span v-text="$t('logs.table.name')">Name</span></th>
                    <th v-on:click="changeOrder('level')"><span v-text="$t('logs.table.level')">Level</span></th>
                </tr>
                </thead>

                <tr v-for="logger in orderBy(filterBy(loggers, filtered), orderProp, reverse === true ? 1 : -1)" :key="logger.name">
                    <td><small>{{logger.name}}</small></td>
                    <td>
                        <button v-on:click="updateLevel(logger.name, 'TRACE')" :class="(logger.level==='TRACE') ? 'btn-primary' : 'btn-light'" class="btn btn-sm">TRACE</button>
                        <button v-on:click="updateLevel(logger.name, 'DEBUG')" :class="(logger.level==='DEBUG') ? 'btn-success' : 'btn-light'" class="btn btn-sm">DEBUG</button>
                        <button v-on:click="updateLevel(logger.name, 'INFO')" :class="(logger.level==='INFO') ? 'btn-info' : 'btn-light'" class="btn btn-sm">INFO</button>
                        <button v-on:click="updateLevel(logger.name, 'WARN')" :class="(logger.level==='WARN') ? 'btn-warning' : 'btn-light'" class="btn btn-sm">WARN</button>
                        <button v-on:click="updateLevel(logger.name, 'ERROR')" :class="(logger.level==='ERROR') ? 'btn-danger' : 'btn-light'" class="btn btn-sm">ERROR</button>
                        <button v-on:click="updateLevel(logger.name, 'OFF')" :class="(logger.level==='OFF') ? 'btn-secondary' : 'btn-light'" class="btn btn-sm">OFF</button>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script lang="ts" src="./logs.component.ts">
</script>
