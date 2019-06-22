<template>
    <div v-if="audits">
        <h2 id="audits-page-heading" v-text="$t('audits.title')">Audits</h2>

        <div class="row">
            <div class="col-md-5">
                <h4 v-text="$t('audits.filter.title')">Filter by date</h4>
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text" v-text="$t('audits.filter.from')">from</span>
                    </div>
                    <input type="date" class="form-control" name="start" v-model="fromDate" v-on:change="transition()" required/>

                    <div class="input-group-append">
                        <span class="input-group-text" v-text="$t('audits.filter.to')">To</span>
                    </div>
                    <input type="date" class="form-control" name="end" v-model="toDate" v-on:change="transition()" required/>
                </div>
            </div>
        </div>

        <div class="alert alert-warning" v-if="!isFetching && audits && audits.length === 0">
            <span v-text="$t('audits.notFound')">No audit found</span>
        </div>
        <div class="table-responsive" v-if="audits && audits.length > 0">
            <table class="table table-sm table-striped">
                <thead>
                <tr>
                    <th v-on:click="changeOrder('auditEventDate', 'timestamp')"><span v-text="$t('audits.table.header.date')">Date</span><font-awesome-icon v-if="propOrder === 'auditEventDate'" icon="sort"></font-awesome-icon></th>
                    <th v-on:click="changeOrder('principal', 'principal')"><span v-text="$t('audits.table.header.principal')">User</span><font-awesome-icon v-if="propOrder === 'principal'" icon="sort"></font-awesome-icon></th>
                    <th v-on:click="changeOrder('auditEventType', 'type')"><span v-text="$t('audits.table.header.status')">State</span><font-awesome-icon v-if="propOrder === 'auditEventType'" icon="sort"></font-awesome-icon></th>
                    <th><span v-text="$t('audits.table.header.data')">Extra data</span></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="audit of orderBy(audits, predicate, reverse === true ? 1 : -1)" :key="audit.timestamp">
                    <td><span>{{audit.timestamp | formatDate}}</span></td>
                    <td><small>{{audit.principal}}</small></td>
                    <td>{{audit.type}}</td>
                    <td>
                        <span v-if="audit.data && audit.data.message">{{audit.data.message}}</span>
                        <span v-if="audit.data && audit.data.remoteAddress"><span v-text="$t('audits.table.data.remoteAddress')">Remote Address</span> {{audit.data.remoteAddress}}</span>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div>
            <div class="row justify-content-center">
                <jhi-item-count :page="page" :total="totalItems" :itemsPerPage="itemsPerPage"></jhi-item-count>
            </div>
            <div class="row justify-content-center">
                <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage" :change="loadPage(page)"></b-pagination>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./audits.component.ts">
</script>
