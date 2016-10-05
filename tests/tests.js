/* jshint jasmine: true */


exports.defineAutoTests = function () {
  var config = {
    testForMultipleAuthenticators: false,
    get fingerPrintAuthenticatorID() {
      return navigator.userAgent.indexOf("Android") > -1 ? "com.onegini.authenticator.Fingerprint" : "com.onegini.authenticator.TouchID"
    }
  };

  var registeredProfileId,
      nrOfUserProfiles,
      pin = "12356";

  if (!config.testForMultipleAuthenticators) {
    console.warn("Testing for multiple authenticators disabled");
  }

  function sendMobileAuthenticationRequest(type) {
    var xhr = new XMLHttpRequest();

    type = type || "push";

    xhr.open("POST", "https://demo-msp.onegini.com/oauth/api/v2/authenticate/user");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", "Basic ODgyMzRCMEU5MzIzNzFCNzY3N0I2QkZCNUFGQTJGMTI1QjY3NkNGNTNBMTExREFGRjQyNjQ3NzM5QzRGMDVDNTo1MTE2NzA5OTM4QUE1MkY2RkI5NDkwRDc3MUE1QzQ0Rjk4N0QxRUE3ODJERUMwNEQwRTM4NzA5NEJBMzVGMzM5");
    xhr.send("callback_uri=https://wwww.onegini.com&message=Test&type=" + type + "&user_id=testclientuserid");
  }

  /******** onegini *********/

  describe('onegini', function () {
    it("onegini should exist", function () {
      expect(window.onegini).toBeDefined();
    });

    describe('start', function () {
      it("should exist", function () {
        expect(onegini.start).toBeDefined();
      });

      it("should run ok", function (done) {
        onegini.start(
            {
              secureXhr: true
            },
            function () {
              expect(true).toBe(true);
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });
    });
  });


  /******** onegini.user (1/2) *********/

  describe('onegini.user', function () {
    it("should exist", function () {
      expect(onegini.user).toBeDefined();
    });

    describe("validatePinWithPolicy", function () {
      it("should exist", function () {
        expect(onegini.user.validatePinWithPolicy).toBeDefined();
      });

      it("should fail because of an incorrect length", function (done) {
        onegini.user.validatePinWithPolicy(
            {
              pin: "incorrect"
            },
            function (result) {
              expect(result).toBeUndefined();
            },
            function (err) {
              expect(err).toBeDefined();
              expect(err.code).toBe(9014);
              done();
            });
      });


      it("should fail because of repeating numbers", function (done) {
        onegini.user.validatePinWithPolicy(
            {
              pin: "11111"
            },
            function (result) {
              expect(result).toBeUndefined();
            },
            function (err) {
              expect(err).toBeDefined();
              expect(err.code).toBe(9013);
              done();
            });
      });

      it("should succeed if pin is compliant to policy", function (done) {
        onegini.user.validatePinWithPolicy(
            {
              pin: pin
            },
            function () {
              expect(true).toBe(true);
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });
    });

    describe("getAuthenticatedUserProfile (1/3)", function () {
      it("should exist", function () {
        expect(onegini.user.getAuthenticatedUserProfile).toBeDefined();
      });

      it("should fail", function (done) {
        onegini.user.getAuthenticatedUserProfile(
            function (result) {
              expect(result).toBeUndefined();
            },
            function (err) {
              expect(err).toBeDefined();
              expect(err.description).toBe("Onegini: No user authenticated.");
              done();
            });
      });
    });

    describe("register", function () {
      it("should have a start method", function () {
        expect(onegini.user.register.start).toBeDefined();
      });

      it("should have a createPin method", function () {
        expect(onegini.user.register.createPin).toBeDefined();
      });

      describe("createPin", function () {
        it("should require a pincode argument", function () {
          expect(function () {
            onegini.user.register.createPin({}, function () {
            }, function () {
            });
          }).toThrow(new TypeError("Onegini: missing 'pin' argument for register.createPin"));
        });

        it("can't be called before 'start' method", function (done) {
          onegini.user.register.createPin(
              {
                pin: pin
              },
              function (result) {
                expect(result).toBeUndefined();
              },
              function (err) {
                expect(err).toBeDefined();
                expect(err.description).toBe("Onegini: createPin called, but no registration in progress. Did you call 'onegini.user.register.start'?");
                done();
              });
        });
      });

      describe('start', function () {
        it("should return pinlength of '5'", function (done) {
          onegini.user.register.start(
              undefined,
              function (result) {
                expect(result).toBeDefined();
                expect(result.pinLength).toBe(5);
                done();
              },
              function (err) {
                expect(err).toBeUndefined();
              });
        });
      });

      describe('createPin', function () {
        it("should return a profileId", function (done) {
          onegini.user.register.createPin(
              {
                pin: pin
              },
              function (result) {
                expect(result).toBeDefined();
                expect(result.profileId).toBeDefined();
                registeredProfileId = result.profileId;
                done();
              },
              function (err) {
                expect(err).toBeUndefined();
              });
        });
      });
    });

    describe("getAuthenticatedUserProfile (2/3)", function () {
      it("should succeed", function (done) {
        onegini.user.getAuthenticatedUserProfile(
            function (result) {
              expect(result).toBeDefined();
              expect(result.profileId).toEqual(registeredProfileId);
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });
    });

    describe('getUserProfiles (1/2)', function () {
      it("should exist", function () {
        expect(onegini.user.getUserProfiles).toBeDefined();
      });

      it("should not be empty", function (done) {
        onegini.user.getUserProfiles(
            function (result) {
              expect(result).toBeDefined();
              nrOfUserProfiles = result.length;
              expect(result[0]).toBeDefined();
              expect(result[0].profileId).toBeDefined();
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });
    });

    describe('logout', function () {
      it("should exist", function () {
        expect(onegini.user.logout).toBeDefined();
      });

      it("should succeed", function (done) {
        onegini.user.logout(
            function () {
              expect(true).toBe(true);
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });
    });

    describe("authenticators (1/2)", function () {
      it("should have a getRegistered method", function () {
        expect(onegini.user.authenticators.getRegistered).toBeDefined();
      });

      it("should have a getNotRegistered method", function () {
        expect(onegini.user.authenticators.getNotRegistered).toBeDefined();
      });

      it("should have a setPreferred method", function () {
        expect(onegini.user.authenticators.setPreferred).toBeDefined();
      });

      it("should have a registerNew method", function () {
        expect(onegini.user.authenticators.registerNew).toBeDefined();
      });

      it("should have a providePin method", function () {
        expect(onegini.user.authenticators.providePin).toBeDefined();
      });

      describe("getRegistered", function () {
        it("should return an error when not logged in", function (done) {
          onegini.user.authenticators.getRegistered(
              function (result) {
                expect(result).toBeUndefined();
              },
              function (err) {
                expect(err).toBeDefined();
                expect(err.description).toBe("Onegini: No user authenticated.");
                done();
              });
        });
      });

      describe('getNotRegistered', function () {
        it("should return an error when not logged in", function (done) {
          onegini.user.authenticators.getNotRegistered(
              function (result) {
                expect(result).toBeUndefined();
              },
              function (err) {
                expect(err).toBeDefined();
                expect(err.description).toBe("Onegini: No user authenticated.");
                done();
              });
        });
      });

      describe("setPreferred", function () {
        it("should fail with  authenticator", function (done) {
          onegini.user.authenticators.setPreferred({
                authenticatorId: "com.onegini.authenticator.PIN"
              },
              function () {
                fail("Success callbacks was called, but method should have failed");
              },
              function (err) {
                expect(err).toBeDefined();
                expect(err.description).toBe("Onegini: No user authenticated.");
                done();
              });
        });
      });

      describe("registerNew", function () {
        it("should require an authenticatorId", function () {
          expect(function () {
            onegini.user.authenticators.registerNew()
          }).toThrow(new TypeError("Onegini: missing 'authenticatorId' argument for authenticators.registerNew"));
        });

        it("should return an error when not logged in", function (done) {
          onegini.user.authenticators.registerNew(
              {
                authenticatorId: 1
              },
              function (result) {
                expect(result).toBeUndefined();
              },
              function (err) {
                expect(err).toBeDefined();
                expect(err.description).toBe("Onegini: No user authenticated.");
                done();
              });
        });
      });
    });

    describe("mobileAuthentication", function () {
      describe('enroll', function () {
        it("should exist", function () {
          expect(onegini.mobileAuthentication.enroll).toBeDefined();
        });

        it("should return an error when not logged in", function (done) {
          onegini.mobileAuthentication.enroll(
              function (result) {
                expect(result).toBeUndefined();
              },
              function (err) {
                expect(err).toBeDefined();
                expect(err.description).toBe("Onegini: No user authenticated.");
                done();
              });
        });
      });
    });

    describe('authenticate', function () {
      describe('start', function () {
        it("should exist", function () {
          expect(onegini.user.authenticate.start).toBeDefined();
        });

        it("should require a profileId", function () {
          expect(function () {
            onegini.user.authenticate.start()
          }).toThrow(new TypeError("Onegini: missing 'profileId' argument for authenticate.start"));
        });

        it('should succeed', function (done) {
          onegini.user.authenticate.start(
              {
                profileId: registeredProfileId
              },
              function () {
                expect(true).toBe(true);
                done();
              },
              function (err) {
                expect(err).toBeUndefined();
              });
        });

        describe('providePin', function () {
          it("should exist", function () {
            expect(onegini.user.authenticate.providePin).toBeDefined();
          });

          it("should require a pin", function () {
            expect(function () {
              onegini.user.authenticate.providePin()
            }).toThrow(new TypeError("Onegini: missing 'pin' argument for authenticate.providePin"));
          });

          it('should fail with incorrect pin', function (done) {
            onegini.user.authenticate.providePin(
                {
                  pin: "incorrect"
                },
                function (result) {
                  expect(result).toBeUndefined();
                },
                function (err) {
                  expect(err).toBeDefined();
                  expect(err.maxFailureCount).toBeDefined();
                  expect(err.remainingFailureCount).toBeDefined();
                  expect(err.description).toBe("Onegini: Incorrect Pin. Check the maxFailureCount and remainingFailureCount properties for details.");
                  done();
                });
          });

          it('should succeed with correct pin', function (done) {
            onegini.user.authenticate.providePin(
                {
                  pin: pin
                },
                function () {
                  expect(true).toBe(true);
                  done();
                },
                function (err) {
                  expect(err).toBeUndefined();
                });
          });
        });

        it('should fail when user is already authenticated', function (done) {
          onegini.user.authenticate.start(
              {
                profileId: registeredProfileId
              },
              function (result) {
                expect(result).toBeUndefined();
              },
              function (err) {
                expect(err).toBeDefined();
                expect(err.description).toBe("Onegini: User already authenticated.");
                done();
              });
        });
      });
    });

    describe("mobileAuthentication", function () {
      describe("enroll", function () {
        it("Should succeed in enrolling an authenticated user", function (done) {
          onegini.mobileAuthentication.enroll(
              function () {
                expect(true).toBe(true);
                done();
              },
              function (err) {
                expect(err).toBeUndefined();
                fail("Error callback was called, but method should have succeeded");
              });
        }, 10000);
      });

      describe("on", function () {
        it('Should exist', function () {
          expect(onegini.mobileAuthentication.on).toBeDefined();
        });

        it('Should accept a mobile confirmation request', function (done) {
          onegini.mobileAuthentication.on("confirmation")
              .shouldAccept(function (request, accept, reject) {
                expect(request.type).toBeDefined();
                expect(request.message).toBeDefined();
                expect(request.profileId).toBeDefined();
                accept();
              })
              .catch(function () {
                fail("Mobile authentication request failed, but should have succeeded");
              })
              .success(function () {
                done();
              });

          sendMobileAuthenticationRequest();
        });

        it('Should reject a mobile authentication request', function (done) {
          onegini.mobileAuthentication.on("confirmation")
              .shouldAccept(function (request, accept, reject) {
                expect(request.type).toBeDefined();
                expect(request.message).toBeDefined();
                expect(request.profileId).toBeDefined();
                reject();
              })
              .catch(function () {
                done();
              })
              .success(function () {
                fail("Mobile authentication request succeeded, but should have failed");
              });

          sendMobileAuthenticationRequest();
        });

        it('Should be able to handle multiple requests', function (done) {
          var counter = 0;

          onegini.mobileAuthentication.on("confirmation")
              .shouldAccept(function (request, accept, reject) {
                expect(request.type).toBeDefined();
                expect(request.message).toBeDefined();
                expect(request.profileId).toBeDefined();
                accept();
              })
              .catch(function () {
                fail('Mobile authentication request failed, but should have succeeded');
              })
              .success(function () {
                counter++;
                if (counter === 2) {
                  done();
                }
              });

          sendMobileAuthenticationRequest();
          sendMobileAuthenticationRequest();
        }, 10000);

        it('Should accept a mobile pin request', function (done) {
          onegini.mobileAuthentication.on("pin")
              .providePin(function (request, accept, reject) {
                expect(request.type).toBeDefined();
                expect(request.message).toBeDefined();
                expect(request.profileId).toBeDefined();
                expect(request.maxFailureCount).toBeDefined();
                expect(request.remainingFailureCount).toBeDefined();

                if (request.remainingFailureCount === request.maxFailureCount - 1) {
                  accept(pin);
                }
                else {
                  accept('invalid');
                }
              })
              .catch(function () {
                fail('Mobile authentication request failed, but should have succeeded');
              })
              .success(function () {
                done();
              });

          sendMobileAuthenticationRequest("push_with_pin");
        }, 10000);

        it('Should reject a mobile pin request', function (done) {
          onegini.mobileAuthentication.on("pin")
              .providePin(function (request, accept, reject) {
                expect(request.type).toBeDefined();
                expect(request.message).toBeDefined();
                expect(request.profileId).toBeDefined();
                expect(request.maxFailureCount).toBeDefined();
                expect(request.remainingFailureCount).toBeDefined();
                reject();
              })
              .catch(function () {
                done();
              })
              .success(function () {
                fail('Mobile authentication request succeeded, but should have failed');
              });

          sendMobileAuthenticationRequest("push_with_pin");
        });
      });
    });

    describe("authenticators (2/2)", function () {
      describe("setPreferred", function () {
        it("Should fail with a non-existing authenticator", function (done) {
          onegini.user.authenticators.setPreferred({
                authenticatorId: "invalid"
              }, function () {
                expect(true).toBe(true);
                fail("Success callback called, but method should have failed.");
              },
              function (err) {
                expect(err).toBeDefined();
                expect(err.description).toBe("Onegini: No such authenticator found");
                done();
              });
        });
      });

      if (config.testForMultipleAuthenticators) {
        describe('getRegistered', function () {
          it("should contain a PIN authenticator", function (done) {
            onegini.user.authenticators.getRegistered(
                function (result) {
                  expect(result).toBeDefined();
                  var nrOfAuthenticators = result.length;
                  expect(nrOfAuthenticators).toBeGreaterThan(0);

                  for (var r in result) {
                    var authenticator = result[r];
                    expect(authenticator.authenticatorId).toBeDefined();
                    if (authenticator.authenticatorId === "com.onegini.authenticator.PIN") {
                      done();
                      return;
                    }
                  }
                  fail("Expected PIN Authenticator not found");
                  done();
                },
                function (err) {
                  expect(err).toBeUndefined();
                });
          });
        });

        describe('getNotRegistered', function () {
          it("should succeed", function (done) {
            onegini.user.authenticators.getNotRegistered(
                function (result) {
                  expect(result).toBeDefined();
                  done();
                },
                function (err) {
                  expect(err).toBeUndefined();
                });
          });
        });

        describe("registerNew", function () {
          it("should succeed", function (done) {
            onegini.user.authenticators.registerNew(
                {
                  authenticatorId: config.fingerPrintAuthenticatorID
                },
                function (result) {
                  expect(result).toBeDefined();
                  done();
                },
                function (err) {
                  expect(err).toBeUndefined();
                  fail("Error callback called, but method should have succeeded");
                });
          });
        });

        describe("providePin", function () {
          it("should require a pin", function () {
            expect(function () {
              onegini.user.authenticators.providePin()
            }).toThrow(new TypeError("Onegini: missing 'pin' argument for authenticators.providePin"));
          });

          it("should fail with incorrect pin", function (done) {
            onegini.user.authenticators.providePin(
                {
                  pin: "incorrect"
                },
                function (result) {
                  expect(result).toBeUndefined();
                },
                function (err) {
                  expect(err).toBeDefined();
                  expect(err.maxFailureCount).toBeDefined();
                  expect(err.remainingFailureCount).toBeDefined();
                  expect(err.description).toBe("Onegini: Incorrect Pin. Check the maxFailureCount and remainingFailureCount properties for details.");
                  done();
                });
          });

          it("should succeed with correct pin", function (done) {
            onegini.user.authenticators.providePin(
                {
                  pin: pin
                },
                function () {
                  expect(true).toBe(true);
                  done();
                },
                function (err) {
                  expect(err).toBeUndefined();
                });
          });
        });

        describe("setPreferred", function () {
          it("Should succeed with an existing authenticator", function (done) {
            onegini.user.authenticators.setPreferred(
                {
                  authenticatorId: config.fingerPrintAuthenticatorID
                }, function () {
                  expect(true).toBe(true);
                  done();
                },
                function (err) {
                  expect(err).toBeUndefined();
                  fail("Error callback called, but method should have failed.");
                });
          });
        });
      }
      else {
        console.warn("Skipping authenticators(2/2). Multiple authenticator tests disabled");
      }
    });
  });

  /******** onegini.resource (1/2) *********/

  describe('onegini.resource', function () {
    it('should exist', function () {
      expect(onegini.resource).toBeDefined();
    });

    describe('fetch', function () {
      it('should exist', function () {
        expect(onegini.resource.fetch).toBeDefined();
      });

      it('should fetch a non-anonymous resource', function (done) {
        onegini.resource.fetch(
            {
              url: 'https://demo-msp.onegini.com/resources/devices',
              headers: {
                'x-test-string': 'foobar',
                'x-test-int': 1337
              }
            },
            function (response) {
              expect(response).toBeDefined();
              var body = response.body;
              expect(body).toBeDefined();
              expect(JSON.parse(body).devices).toBeDefined();
              expect(response.headers).toBeDefined();
              expect(response.status).toEqual(200);
              expect(response.statusText).toBeDefined();
              done();
            }, function (err) {
              expect(err).toBeUndefined();
              fail('Error callback called, but method should have succeeded');
            });
      });

      it("should require a url", function () {
        expect(function () {
          onegini.resource.fetch();
        }).toThrow(new TypeError("Onegini: missing 'url' argument for fetch"));
      });

      it('should return error context when request fails', function (done) {
        onegini.resource.fetch({
              method: 'POST',
              url: 'https://demo-msp.onegini.com/resources/devices'
            }, function (response) {
              expect(response).toBeUndefined();
              fail('Success callback called, but method should have failed');
            },
            function (response) {
              expect(response).toBeDefined();
              expect(response.status).toEqual(405);
              done();
            })
      });

      it('should intercept an XMLHttpRequest', function (done) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://demo-msp.onegini.com/resources/devices');
        xhr.onload = function () {
          expect(this.readyState).toEqual(4);
          expect(this.status).toBe(200);
          expect(JSON.parse(this.responseText).devices).toBeDefined();
          done();
        };
        xhr.send();
      });
    });
  });

  /******** onegini.user (2/2) *********/

  describe('onegini.user', function () {
    describe('changePin', function () {
      describe('start', function () {
        it("should exist", function () {
          expect(onegini.user.changePin.start).toBeDefined();
        });

        it("should require a pin", function () {
          expect(function () {
            onegini.user.changePin.start()
          }).toThrow(new TypeError("Onegini: missing 'pin' argument for changePin.start"));
        });
      });

      describe('createPin', function () {
        it("should exist", function () {
          expect(onegini.user.changePin.createPin).toBeDefined();
        });

        it("should require a pin", function () {
          expect(function () {
            onegini.user.changePin.createPin()
          }).toThrow(new TypeError("Onegini: missing 'pin' argument for changePin.createPin"));
        });
      });

      it('should fail with incorrect current pin', function (done) {
        onegini.user.changePin.start(
            {
              pin: "incorrect"
            },
            function (result) {
              expect(result).toBeUndefined();
            },
            function (err) {
              expect(err).toBeDefined();
              expect(err.maxFailureCount).toBeDefined();
              expect(err.remainingFailureCount).toBeDefined();
              expect(err.description).toBe("Onegini: Incorrect Pin. Check the maxFailureCount and remainingFailureCount properties for details.");
              done();
            });
      });

      it("should return pinlength of '5' when correct pin is supplied", function (done) {
        onegini.user.changePin.start(
            {
              pin: pin
            },
            function (result) {
              expect(result).toBeDefined();
              expect(result.pinLength).toBe(5);
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });

      it('should fail with new pin non-compliant with pin policy', function (done) {
        onegini.user.changePin.createPin(
            {
              pin: "incorrect"
            },
            function () {
              fail("Success callback was called while action should have failed");
            },
            function (err) {
              expect(err).toBeDefined();
              expect(err.description).toBeDefined();
              expect(err.code).toBe(9014);
              done();
            });
      });

      it('should succeed with new pin compliant to pin policy', function (done) {
        onegini.user.changePin.createPin(
            {
              pin: pin
            },
            function () {
              expect(true).toBe(true);
              done();
            },
            function (err) {
              fail("Error callback was called while action should have succeeded");
            });
      });
    });

    describe('reauthenticate', function () {
      describe('start', function () {
        it("should exist", function () {
          expect(onegini.user.reauthenticate.start).toBeDefined();
        });

        it("should require a profileId", function () {
          expect(function () {
            onegini.user.reauthenticate.start()
          }).toThrow(new TypeError("Onegini: missing 'profileId' argument for reauthenticate.start"));
        });

        it('should succeed', function (done) {
          onegini.user.reauthenticate.start(
              {
                profileId: registeredProfileId
              },
              function (result) {
                expect(result).toBeDefined();
                done();
              },
              function (err) {
                expect(err).toBeUndefined();
              });
        });

        describe('providePin', function () {
          it("should exist", function () {
            expect(onegini.user.reauthenticate.providePin).toBeDefined();
          });

          it("should require a pin", function () {
            expect(function () {
              onegini.user.reauthenticate.providePin()
            }).toThrow(new TypeError("Onegini: missing 'pin' argument for reauthenticate.providePin"));
          });

          it('should fail with incorrect pin', function (done) {
            onegini.user.reauthenticate.providePin(
                {
                  pin: "incorrect"
                },
                function (result) {
                  expect(result).toBeUndefined();
                },
                function (err) {
                  expect(err).toBeDefined();
                  expect(err.maxFailureCount).toBeDefined();
                  expect(err.remainingFailureCount).toBeDefined();
                  expect(err.description).toBe("Onegini: Incorrect Pin. Check the maxFailureCount and remainingFailureCount properties for details.");
                  done();
                });
          });

          it('should succeed with correct pin', function (done) {
            onegini.user.reauthenticate.providePin(
                {
                  pin: pin
                },
                function () {
                  expect(true).toBe(true);
                  done();
                },
                function (err) {
                  expect(err).toBeUndefined();
                });
          });
        });
      });
    });

    describe('isUserRegistered', function () {
      it("should exist", function () {
        expect(onegini.user.isUserRegistered).toBeDefined();
      });

      it("'profileId' argument mandatory", function () {
        expect(function () {
          onegini.user.isUserRegistered({}, function () {
          }, function () {
          });
        }).toThrow(new TypeError("Onegini: missing 'profileId' argument for isUserRegistered"));
      });

      it("should succeed with correct profileId", function (done) {
        onegini.user.isUserRegistered(
            {
              profileId: registeredProfileId
            },
            function (result) {
              expect(result).toBe(true);
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });

      it("should fail with incorrect profileId", function (done) {
        onegini.user.isUserRegistered(
            {
              profileId: "UNKNOWN"
            },
            function (result) {
              expect(result).toBe(false);
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });
    });

    describe('deregister', function () {
      it("should exist", function () {
        expect(onegini.user.deregister).toBeDefined();
      });

      it("'profileId' argument mandatory", function () {
        expect(function () {
          onegini.user.deregister({}, function () {
          }, function () {
          });
        }).toThrow(new TypeError("Onegini: missing 'profileId' argument for deregister"));
      });

      it("no user found for profileId", function (done) {
        onegini.user.deregister(
            {
              profileId: "UNKNOWN"
            },
            function (result) {
              expect(result).toBeUndefined();
            },
            function (err) {
              expect(err).toBeDefined();
              expect(err.description).toBe("Onegini: No registered user found.");
              done();
            });
      });

      it("should succeed with correct profileId", function (done) {
        onegini.user.deregister(
            {
              profileId: registeredProfileId
            },
            function (result) {
              expect(result).toBeDefined();
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });
    });

    describe("getAuthenticatedUserProfile (3/3)", function () {
      it("should fail again", function (done) {
        onegini.user.getAuthenticatedUserProfile(
            function (result) {
              expect(result).toBeUndefined();
            },
            function (err) {
              expect(err).toBeDefined();
              expect(err.description).toBe("Onegini: No user authenticated.");
              done();
            });
      });
    });

    describe('getUserProfiles (2/2)', function () {
      it("should be one less", function (done) {
        onegini.user.getUserProfiles(
            function (result) {
              expect(result).toBeDefined();
              expect(result.length).toBeLessThan(nrOfUserProfiles);
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });
    });

  });


  /******** onegini.device *********/

  describe('onegini.device', function () {
    it("should exist", function () {
      expect(onegini.device).toBeDefined();
    });

    describe("authenticate", function () {
      it("should exist", function () {
        expect(onegini.device.authenticate).toBeDefined();
      });

      it('should fail with invalid scopes', function (done) {
        onegini.device.authenticate(
            {
              scopes: ["incorrect"]
            },
            function () {
              expect(true).toBe(false);
            },
            function (err) {
              expect(err).toBeDefined();
              done();
            });
      });

      it('should succeed with valid scopes', function (done) {
        onegini.device.authenticate(
            {
              scopes: ["application-details"]
            },
            function () {
              expect(true).toBe(true);
              done();
            },
            function (err) {
              expect(err).toBeUndefined();
            });
      });
    });
  });

  /******** onegini.resource (2/2) *********/

  describe('onegini.resource', function () {
    it('should fetch an anonymous resource', function (done) {
      onegini.resource.fetch({
            url: 'https://demo-msp.onegini.com/resources/application-details',
            anonymous: true
          },
          function (response) {
            expect(response).toBeDefined();
            expect(response.body).toBeDefined();
            expect(response.headers).toBeDefined();
            expect(response.status).toEqual(200);
            expect(response.statusText).toBeDefined();
            done();
          },
          function (errResponse) {
            expect(errResponse).toBeUndefined();
            fail('Error response called, but method should have succeeded');
          })
    })
  });
};