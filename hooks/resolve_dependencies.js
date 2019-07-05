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

const fs = require('fs');
const path = require('path');
const os = require('os');
const spawn = require('child_process').spawn;

module.exports = function (context) {
  const pluginId = 'cordova-plugin-onegini';
  const deferral = require('q').defer();
  const platform = context.opts.plugin.platform;

  // We only want to invoke the plugin for the iOS platform since it doesn't make any sense to resolve the iOS SDK dependencies when
  // you only have the Android platform installed.
  if (platform !== 'ios') {
    return;
  }

  console.log(`${pluginId}: Resolving Onegini iOS SDK dependencies...`);

  const cwd = path.join(context.opts.plugin.pluginInfo.dir, 'src/ios');
  const options = {
    cwd: cwd,
    shell: true
  };
  executable = getGradleExecutableForPlatform();
  const gradle = spawn(executable, ['clean', 'resolveDependencies'], options);

  gradle.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  gradle.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  gradle.on('close', (code) => {
    if (code === 0) {
      console.log(`${pluginId}: Resolved dependencies.`);
      deferral.resolve();
    } else {
      deferral.reject(`${pluginId}: Error: cannot resolve dependencies! Make sure you have access to the Onegini repository. See the installation documentation for more info.`);
    }
  });

  return deferral.promise;
};

function getGradleExecutableForPlatform() {
  const osFamily = os.platform();

  var executable = './gradlew';
  if (osFamily.toLowerCase().startsWith('win')) {
    executable = 'gradlew.bat';
  }

  return executable;
}
