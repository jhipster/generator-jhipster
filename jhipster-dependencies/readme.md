if you want to customize the generated site, look at this file: src/site/site.xml  

If you want to release:

run mvn -Dresume=false release:prepare release:perform -Pnexus-pro, be sure the gpg agent is running 
Also configure your settings.xml <servers> section with two server: github and release-profile.

If you have a passphrase, configure a profile in your settings.xml like this:

<profile>
			<id>release</id>
			<properties>
              <pgp.secretkey><![CDATA[keyring:id=idOfTheKeyring]]></pgp.secretkey>
              <pgp.passphrase>file:/var/lib/jenkins/.gnupg/maven-gpg-password.txt</pgp.passphrase>
			</properties>
		</profile>