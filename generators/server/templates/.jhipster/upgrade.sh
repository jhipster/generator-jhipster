#! /bin/bash

run() {
	assertGitPresent
	assertNoLocalChanges
	checkLatestVersion
	switchToUpdateBranch
	generateBeforeUpgrade
	npmUpdate
	generateAfterUpgrade
	mergeChangesBack
}

assertGitPresent() {
	if [ ! -d .git ]; then
	    echo "Git is missing. Please upgrade manually or... move to Git !! (you really should)"
	    exit 1
	fi
}

assertNoLocalChanges() {
	# ensure no local changes
	if ! git diff-index --quiet HEAD --; then
		echo "Local changes detected. Please stash / commit them before upgrading"
		exit 1
	fi
}

checkLatestVersion() {
	echo "-----------------------------------------"
	echo "-- LOOKING FOR LATEST JHIPSTER VERSION --"
	echo "-----------------------------------------"
	current_version=`npm ls generator-jhipster | grep -oP generator-jhipster@.* | cut -d @ -f 2`
	echo "Current generator-jhipster version is : $current_version"
	latest_version=`npm view generator-jhipster version -g`
	echo "Latest generator-jhipster version is : $latest_version"
	
	if [ $latest_version == $current_version ]; then 
	    echo "No upgrade needed, you are up-to-date"
	    exit 0
	else 
	    echo "Proceeding with upgrade..."
	fi
}

switchToUpdateBranch() {
	# remind which branch we are on (probably master)
	src_branch=$(git rev-parse --abbrev-ref HEAD)
	git rev-parse -q --verify update_jhipster
	if [ $? != 0 ]; then
	    # create update_jhipster branch
	    git branch update_jhipster
	fi
	# switch to update_jhipster branch
	git checkout update_jhipster
	echo "Switched to 'update_jhipster' branch"
}

generateBeforeUpgrade() {
	echo "----------------------------------------------"
	echo "-- REGENERATE WITH CURRENT JHIPSTER VERSION --"
	echo "----------------------------------------------"
	generate
	git commit -m "Prepare upgrade from version $current_version to $latest_version" -a
}

npmUpdate() {
	echo "-----------------------------------------"
	echo "------- UPGRADE JHIPSTER GENERATOR ------"
	echo "-----------------------------------------"
	npm uninstall -g generator-jhipster
	npm install -g generator-jhipster
	new_version=`npm ls generator-jhipster | grep -oP generator-jhipster@.* | cut -d @ -f 2`
	echo "New generator-jhipster version is : $new_version"
}

mergeChangesBack() {
	# switch back on source branch and try to merge
	git checkout $src_branch
	git merge update_jhipster
}

generateAfterUpgrade() {
	echo "-------------------------------------------"
	echo "- REGENERATE WITH LATEST JHIPSTER VERSION -"
	echo "-------------------------------------------"
	generate
	git add -A
	git commit -m "Upgraded to version $new_version"
}

generate() {
	# Remove everything in directory"
	git rm -rq *
	rm -rf *
	
	echo "Generate jhipster app from scratch"
	yo jhipster --force --with-entities
}

run