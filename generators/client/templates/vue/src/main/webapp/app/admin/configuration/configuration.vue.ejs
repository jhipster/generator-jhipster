<template>
    <div>
        <h2 id="configuration-page-heading" v-text="$t('configuration.title')">Configuration</h2>

        <div v-if="allConfiguration && configuration">
            <span v-text="$t('configuration.filter')">Filter (by prefix)</span> <input type="text" v-model="filtered" class="form-control">
            <h3>Spring configuration</h3>
            <table class="table table-striped table-bordered table-responsive d-table">
                <thead>
                <tr>
                    <th class="w-40" v-on:click="changeOrder('prefix')"><span v-text="$t('configuration.table.prefix')">Prefix</span></th>
                    <th class="w-60" v-on:click="changeOrder('properties')"><span v-text="$t('configuration.table.properties')">Properties</span></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="entry in orderBy(filterBy(configuration, filtered), orderProp, reverse === true ? 1 : -1)">
                    <td><span>{{entry.prefix}}</span></td>
                    <td>
                        <div class="row" v-for="key in keys(entry.properties)">
                            <div class="col-md-4">{{key}}</div>
                            <div class="col-md-8">
                                <span class="float-right badge-secondary break">{{entry.properties[key]}}</span>
                            </div>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
            <div v-for="key in keys(allConfiguration)">
                <h4><span>{{key}}</span></h4>
                <table class="table table-sm table-striped table-bordered table-responsive d-table">
                    <thead>
                    <tr>
                        <th class="w-40">Property</th>
                        <th class="w-60">Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item of allConfiguration[key]">
                        <td class="break">{{item.key}}</td>
                        <td class="break">
                            <span class="float-right badge-secondary break">{{item.val}}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./configuration.component.ts">
</script>
