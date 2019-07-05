/*
 * Copyright (c) 2017 Onegini B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const supportedPlatforms = ['android', 'ios'];
const envVariables = {
  enableAutoconfigure: 'ONEGINI_AUTOCONFIGURE',
  configuratorName: 'ONEGINI_SDK_CONFIGURATOR_PATH',
  configFiles: {
    android: 'ONEGINI_CONFIG_ANDROID_PATH',
    ios: 'ONEGINI_CONFIG_IOS_PATH'
  }
};

module.exports = function (context) {
  if (process.env.ONEGINI_AUTOCONFIGURE === "false") {
    console.log('ONEGINI_AUTOCONFIGURE is set to false. Skipping Onegini SDK Configuration');
    return;
  }

  const deferral = require('q').defer();
  const args = [
    '--cordova',
    '--app-dir', context.opts.projectRoot
  ];
  console.log('Configuring the Onegini SDK');
  console.log('===========================\n\n');

  // deduce the platforms based on whatever in the whitelist is currently installed
  const platforms = supportedPlatforms.filter(platform => fs.existsSync(path.join(context.opts.projectRoot, "platforms", platform)));

  platforms
      .map(platform => platform.split('@')[0])
      .forEach(platform => {
        console.log(`Configuring the ${platform} platform`);
        console.log('--------------------------' + new Array(platform.length).join('-') + '\n');

        let platformArgs = args.slice();
        platformArgs.unshift(platform);
        platformArgs.push('--config', getConfigFileForPlatform(context.opts.projectRoot, platform));

        execConfigurator(platformArgs, deferral);
      });

  return deferral.promise;
};

function execConfigurator(args, deferral) {
  const configuratorName = getConfiguratorName();

  console.log('\nRunning command:');
  console.log(`${configuratorName} ${args.join(' ')}\n`);

  const configurator = spawn(configuratorName, args);

  configurator.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  configurator.stderr.on('data', (data) => {
    process.stdout.write(data);
  });

  configurator.on('close', (code) => {
    if (code === 0) {
      deferral.resolve();
    } else {
      deferral.reject('Could not configure the Onegini SDK with your configuration');
    }
  });
}

function getConfigFileForPlatform(projectRoot, platform) {
  const environmentVar = envVariables.configFiles[platform];
  const environmentLocation = process.env[environmentVar];
  const defaultLocation = `${projectRoot}/onegini-config-${platform}.zip`;

  if (environmentLocation) {
    console.log(`Using Token Server config zip: '${environmentLocation}' set in '${environmentVar}'`);
    return environmentLocation;
  }

  console.log(`Using default Token Server config zip: '${defaultLocation}'`);
  return defaultLocation;
}

function getConfiguratorName() {
  const environmentVar = envVariables.configuratorName;
  const environmentName = process.env[environmentVar];
  const defaultName = 'onegini-sdk-configurator';

  if (environmentName) {
    console.log(`Using SDK Configurator executable in '${environmentName}' set in '${environmentVar}'`);
    return environmentName;
  }

  console.log('Using SDK Configurator from $PATH');
  return defaultName;
}
