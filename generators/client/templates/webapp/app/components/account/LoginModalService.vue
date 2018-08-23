<script>
    export default {
        name: 'LoginModalService',
        methods: {
            openLogin: function () {
                this.$root.$emit('bv::show::modal','loginModal')
            }
        }
    }
</script>
