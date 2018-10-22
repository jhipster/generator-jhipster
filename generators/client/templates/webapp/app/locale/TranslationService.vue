<script>
    import axios from 'axios'

    export default {
        name: 'TranslationService',
        data () {
            return {
                currentLanguage: 'en'
            }
        },
        created() {
            this.refreshTranslations();
        },
        watch: {
            currentLanguage: function () {
                this.refreshTranslations();
            }
        },
        methods: {
            refreshTranslations: function () {
                if (this.$i18n && !this.$i18n.messages[this.currentLanguage]) {
                    let vm = this;
                    this.$i18n.setLocaleMessage(this.currentLanguage, {});
                    axios.get('i18n/' + this.currentLanguage + '.json').then(function (res) {
                        if (res.data) {
                            vm.$i18n.setLocaleMessage(vm.currentLanguage, res.data);
                            vm.$i18n.locale = vm.currentLanguage;
                        }
                    });
                } else if (this.$i18n) {
                    this.$i18n.locale = this.currentLanguage;
                }
            }
        }
    }
</script>
