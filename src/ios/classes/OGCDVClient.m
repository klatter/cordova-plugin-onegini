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

#import <Cordova/CDVViewController.h>
#import "OGCDVClient.h"
#import "OGCDVConstants.h"
#import "OneginiConfigModel.h"
#import "OGCDVPushMobileAuthRequestClient.h"

@implementation OGCDVClient {
}

- (void)pluginInitialize
{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationDidFinishLaunchingNotification:)
                                                 name:UIApplicationDidFinishLaunchingNotification object:nil];
}

- (void)applicationDidFinishLaunchingNotification:(NSNotification *)notification
{
    self.launchNotificationUserInfo = notification.userInfo[UIApplicationLaunchOptionsRemoteNotificationKey];
}

- (void)start:(CDVInvokedUrlCommand *)command
{
    [self.commandDelegate runInBackground:^{
        [[[ONGClientBuilder new] build] start:^(BOOL result, NSError *error) {
            if (error != nil) {
                [self sendErrorResultForCallbackId:command.callbackId withError:error];
                return;
            }

            NSDictionary *config = @{OGCDVPluginKeyResourceBaseURL: OneginiConfigModel.configuration[ONGResourceBaseURL]};
            [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:config] callbackId:command.callbackId];
            // [self handleLaunchNotification];
        }];
    }];
}

- (void)handleLaunchNotification
{
    NSDictionary *userInfo = self.launchNotificationUserInfo;

    if (userInfo != nil) {
        OGCDVPushMobileAuthRequestClient *mobileAuthenticationRequestClient = [(CDVViewController *)self.viewController
            getCommandInstance:OGCDVPluginClassPushMobileAuthRequestClient];
        ONGPendingMobileAuthRequest *pendingMobileAuthRequest = [[ONGUserClient sharedInstance] pendingMobileAuthRequestFromUserInfo:userInfo];
        [[ONGUserClient sharedInstance] handlePendingPushMobileAuthRequest:pendingMobileAuthRequest delegate:mobileAuthenticationRequestClient];
    }
}

@end
