AlertServiceConfig.$inject = ['AlertServiceProvider'];

export function AlertServiceConfig(AlertServiceProvider) {
    // set below to true to make alerts look like toast
    AlertServiceProvider.showAsToast(false);
}
