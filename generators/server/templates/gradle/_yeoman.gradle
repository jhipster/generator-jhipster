apply plugin: 'com.moowork.node'

task bower(type: NodeTask) {
    description = "Installs dependencies using Bower"
    script = file("${project.projectDir}/node_modules/bower/bin/bower")
    args = ['install']
}

<%_ if (clientPackageManager === 'yarn') { _%>
// Workaround for https://github.com/srs/gradle-node-plugin/issues/134 doesn't work with yarn
if (!project.hasProperty('nodeInstall')) {
    bower.dependsOn yarn_install
} else {
    bower.dependsOn npm_install
}
<%_ } else if (clientPackageManager === 'npm') { _%>
bower.dependsOn npm_install
<%_ } _%>
processResources.dependsOn bower
bower.onlyIf { !project.hasProperty('skipBower') }
