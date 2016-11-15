package com.onegini.handler;

import static com.onegini.OneginiCordovaPluginConstants.AUTH_EVENT_FINGERPRINT_CAPTURED;
import static com.onegini.OneginiCordovaPluginConstants.AUTH_EVENT_FINGERPRINT_FAILED;
import static com.onegini.OneginiCordovaPluginConstants.AUTH_EVENT_PIN_REQUEST;
import static com.onegini.OneginiCordovaPluginConstants.AUTH_EVENT_SUCCESS;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Queue;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;

import com.onegini.mobile.sdk.android.handlers.OneginiMobileAuthenticationHandler;
import com.onegini.mobile.sdk.android.handlers.error.OneginiError;
import com.onegini.mobile.sdk.android.handlers.error.OneginiMobileAuthenticationError;
import com.onegini.mobile.sdk.android.handlers.request.OneginiMobileAuthenticationFingerprintRequestHandler;
import com.onegini.mobile.sdk.android.handlers.request.OneginiMobileAuthenticationPinRequestHandler;
import com.onegini.mobile.sdk.android.handlers.request.OneginiMobileAuthenticationRequestHandler;
import com.onegini.mobile.sdk.android.handlers.request.callback.OneginiAcceptDenyCallback;
import com.onegini.mobile.sdk.android.handlers.request.callback.OneginiFingerprintCallback;
import com.onegini.mobile.sdk.android.handlers.request.callback.OneginiPinCallback;
import com.onegini.mobile.sdk.android.model.entity.AuthenticationAttemptCounter;
import com.onegini.mobile.sdk.android.model.entity.OneginiMobileAuthenticationRequest;
import com.onegini.mobileAuthentication.Callback;
import com.onegini.mobileAuthentication.ConfirmationCallback;
import com.onegini.mobileAuthentication.FingerprintCallback;
import com.onegini.mobileAuthentication.PinCallback;
import com.onegini.util.PluginResultBuilder;

public class MobileAuthenticationHandler
    implements OneginiMobileAuthenticationHandler, OneginiMobileAuthenticationRequestHandler, OneginiMobileAuthenticationPinRequestHandler, OneginiMobileAuthenticationFingerprintRequestHandler {

  private static MobileAuthenticationHandler instance = null;
  private final HashMap<Callback.Method, CallbackContext> challengeReceivers = new HashMap<Callback.Method, CallbackContext>();
  private final Queue<Callback> callbackQueue = new LinkedList<Callback>();
  private boolean isRunning = false;

  protected MobileAuthenticationHandler() {
  }

  public static MobileAuthenticationHandler getInstance() {
    if (instance == null) {
      instance = new MobileAuthenticationHandler();
    }

    return instance;
  }

  public Callback getCurrentCallback() {
    if (!isRunning) {
      return null;
    }

    return callbackQueue.peek();
  }

  public void registerAuthenticationChallengeReceiver(final Callback.Method method, final CallbackContext callbackContext) {
    challengeReceivers.put(method, callbackContext);
    handleNextAuthenticationRequest();
  }

  // *START* Handling mobile authentication without additional authentication (confirmation request)

  @Override
  public void startAuthentication(final OneginiMobileAuthenticationRequest mobileAuthenticationRequest,
                                  final OneginiAcceptDenyCallback acceptDenyCallback) {
    final ConfirmationCallback confirmationCallback = new ConfirmationCallback(mobileAuthenticationRequest, acceptDenyCallback);
    addAuthenticationRequestToQueue(confirmationCallback);
  }

  // *END*

  // *START* Handling mobile authentication with PIN

  @Override
  public void startAuthentication(final OneginiMobileAuthenticationRequest oneginiMobileAuthenticationRequest, final OneginiPinCallback oneginiPinCallback,
                                  final AuthenticationAttemptCounter authenticationAttemptCounter) {
    final PinCallback pinCallback = new PinCallback(oneginiMobileAuthenticationRequest, oneginiPinCallback, authenticationAttemptCounter);
    addAuthenticationRequestToQueue(pinCallback);

    // TODO: Check if this request is a fallback from another request.
  }

  @Override
  public void onNextAuthenticationAttempt(final AuthenticationAttemptCounter authenticationAttemptCounter) {
    final CallbackContext callbackContext = getChallengeReceiverForCallbackMethod(Callback.Method.PIN);
    final PinCallback pinCallback = (PinCallback) callbackQueue.peek();

    callbackContext.sendPluginResult(new PluginResultBuilder()
        .withSuccess()
        .shouldKeepCallback()
        .withAuthenticationEvent(AUTH_EVENT_PIN_REQUEST)
        .withRemainingFailureCount(authenticationAttemptCounter.getRemainingAttempts())
        .withMaxFailureCount(authenticationAttemptCounter.getMaxAttempts())
        .withOneginiMobileAuthenticationRequest(pinCallback.getMobileAuthenticationRequest())
        .build());
  }

  // *END*

  // *START* Handling mobile authentication with Fingerprint

  @Override
  public void startAuthentication(final OneginiMobileAuthenticationRequest oneginiMobileAuthenticationRequest,
                                  final OneginiFingerprintCallback oneginiFingerprintCallback) {
    final FingerprintCallback fingerprintCallback = new FingerprintCallback(oneginiMobileAuthenticationRequest, oneginiFingerprintCallback);
    addAuthenticationRequestToQueue(fingerprintCallback);
  }

  @Override
  public void onNextAuthenticationAttempt() {
    final FingerprintCallback fingerprintCallback = (FingerprintCallback) callbackQueue.peek();
    final CallbackContext callbackContext = getChallengeReceiverForCallbackMethod(Callback.Method.FINGERPRINT);

    callbackContext.sendPluginResult(new PluginResultBuilder()
        .withSuccess()
        .shouldKeepCallback()
        .withAuthenticationEvent(AUTH_EVENT_FINGERPRINT_FAILED)
        .withOneginiMobileAuthenticationRequest(fingerprintCallback.getMobileAuthenticationRequest())
        .build());
  }

  @Override
  public void onFingerprintCaptured() {
    final FingerprintCallback fingerprintCallback = (FingerprintCallback) callbackQueue.peek();
    final CallbackContext callbackContext = getChallengeReceiverForCallbackMethod(Callback.Method.FINGERPRINT);

    callbackContext.sendPluginResult(new PluginResultBuilder()
        .withSuccess()
        .shouldKeepCallback()
        .withAuthenticationEvent(AUTH_EVENT_FINGERPRINT_CAPTURED)
        .withOneginiMobileAuthenticationRequest(fingerprintCallback.getMobileAuthenticationRequest())
        .build());
  }

  // *END*

  // *START* Mobile authentication Handler methods

  @Override
  public void onSuccess() {
    finishAuthenticationRequest(null);
  }


  @Override
  public void onError(final OneginiMobileAuthenticationError oneginiMobileAuthenticationError) {
    finishAuthenticationRequest(oneginiMobileAuthenticationError);
  }

  // *END*

  private void handleNextAuthenticationRequest() {
    final Callback callback = callbackQueue.peek();

    if (isRunning || callback == null) {
      return;
    }

    final CallbackContext callbackContext = getChallengeReceiverForCallbackMethod(callback.getMethod());
    if (callbackContext == null) {
      return;
    }

    isRunning = true;
    final OneginiMobileAuthenticationRequest mobileAuthenticationRequest = callback.getMobileAuthenticationRequest();
    final PluginResultBuilder pluginResultBuilder = new PluginResultBuilder();

    pluginResultBuilder
        .withSuccess()
        .shouldKeepCallback()
        .withAuthenticationEvent(callback.getAuthenticationRequestEventName())
        .withOneginiMobileAuthenticationRequest(mobileAuthenticationRequest);

    if (callback instanceof PinCallback) {
      final PinCallback pinCallback = (PinCallback) callback;
      pluginResultBuilder
          .withRemainingFailureCount(pinCallback.getAuthenticationAttemptCounter().getRemainingAttempts())
          .withMaxFailureCount(pinCallback.getAuthenticationAttemptCounter().getRemainingAttempts());
    }

    callbackContext.sendPluginResult(pluginResultBuilder.build());
  }

  private void addAuthenticationRequestToQueue(final Callback callback) {
    callbackQueue.add(callback);
    handleNextAuthenticationRequest();
  }

  private void finishAuthenticationRequest(final OneginiError oneginiError) {
    Callback callback = callbackQueue.poll();
    if (callback == null) {
      // We don't have a callback anymore so we cannot perform any callback. We'll just continue to process the next authentication request
      startProcessingNextAuthenticationRequest();
      return;
    }

    final CallbackContext callbackContext = callback.getChallengeResponseCallbackContext();
    final PluginResult pluginResult;

    if (oneginiError == null) {
      pluginResult = new PluginResultBuilder()
          .withSuccess()
          .build();
    } else {
      pluginResult = new PluginResultBuilder()
          .withOneginiError(oneginiError)
          .build();
    }

    callbackContext.sendPluginResult(pluginResult);

    startProcessingNextAuthenticationRequest();
  }

  private void startProcessingNextAuthenticationRequest() {
    isRunning = false;
    handleNextAuthenticationRequest();
  }

  private CallbackContext getChallengeReceiverForCallbackMethod(final Callback.Method method) {
    return challengeReceivers.get(method);
  }

  @Override
  public void finishAuthentication() {
    // We don't want to do anything here because the onSuccess or onError methods of the handler will be called. This method is a convenience method when you
    // already want to close your UI dialog after authentication was finished.
  }

}
