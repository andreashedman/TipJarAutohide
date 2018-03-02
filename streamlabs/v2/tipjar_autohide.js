/*
   TipJar Autohide - hide streamlabs tip jar (THE JAR)
   Copyright 2018 - Andreas Hedman (CMDR Black Salve)
*/
class TipJar_Autohide
{
   constructor(socketToken, config)
   {
      this.socketToken = socketToken;
      this.config = config == null ? {} : config;
   }

   deleteTimers()
   {
      console.log("TipJar_Autohide::deleteTimers");
      if (this.cup_timerId != null)
      {
         clearTimeout(this.cup_timerId);
         this.cup_timerId = null;
      }

      if (this.bits_timerId != null)
      {
         clearTimeout(this.bits_timerId);
         this.bits_timerId = null;
      }
   }

   onStreamlabsEvent(_for, _type)
   {
      console.log("TipJar_Autohide::onStreamlabsEvent");
      console.log("_for = " + _for + "   _type = " + _type);

      if (_for == "initialize" && _type == "initialize")
      {
         // always accept this event
      }
      else if (_for == "streamlabs" && _type == "donation")
      {
         if (!this.event_Tips)
            return false;
      }
      else if (_for == "twitch_account" && _type == "follow")
      {
         if (!this.event_TwitchFollows)
            return false;
      }
      else if (_for == "twitch_account" && _type == "bits")
      {
         if (!this.event_TwitchBitsCheers)
            return false;
      }
      else if (_for == "twitch_account" && _type == "subscription")
      {
         if (!this.event_TwitchSubsAndResubs)
            return false;
      }
      else 
      {
         // unknown event
         return false;
      }

      if (this.cup_timerId != null)
      {
         clearTimeout(this.cup_timerId);
         this.cup_timerId = null;
      }

      if (this.bits_timerId != null)
      {
         clearTimeout(this.bits_timerId);
         this.bits_timerId = null;
      }

      this.container_bits.style.opacity = this.bits_opacity;
      this.container_cup.style.opacity = this.cup_opacity;

      this.cup_timerId = setTimeout(this.onTipJarCupFadein.bind(this), this.cup_fadeinTimeout);
      this.bits_timerId = setTimeout(this.onTipJarBitsFadein.bind(this), this.bits_fadeinTimeout);

   }

   onTipJarBitsFadein()
   {

      //console.log("TipJar_Autohide::onTipJarBitsFadein");
      this.bits_opacity += this.addition;

      if (this.bits_opacity > 1)
      {
         this.bits_opacity = 1.0;
      }

      this.container_bits.style.opacity = this.bits_opacity;

      if (this.bits_opacity < 1)
      {
         this.bits_timerId = setTimeout(this.onTipJarBitsFadein.bind(this), this.timeoutFrequency);
      } else
      {
         this.bits_timerId = setTimeout(this.onTipJarBitsFadeout.bind(this), this.bits_inactivityTimeout);
      }
   }

   onTipJarCupFadein()
   {
      // console.log("TipJar_Autohide::onTipJarCupFadein");
      this.cup_opacity += this.addition;

      if (this.cup_opacity > 1)
      {
         this.cup_opacity = 1.0;
      }
      this.container_cup.style.opacity = this.cup_opacity;

      if (this.cup_opacity < 1)
      {
         this.cup_timerId = setTimeout(this.onTipJarCupFadein.bind(this), this.timeoutFrequency);
      } else
      {
         this.cup_timerId = setTimeout(this.onTipJarCupFadeout.bind(this), this.cup_inactivityTimeout);
      }
   }


   onTipJarBitsFadeout()
   {

      this.bits_opacity -= this.subtract;

      if (this.bits_opacity < 0)
      {
         this.bits_opacity = 0.0;
      }

      this.container_bits.style.opacity = this.bits_opacity;

      if (this.bits_opacity > 0)
      {
         this.bits_timerId = setTimeout(this.onTipJarBitsFadeout.bind(this), this.timeoutFrequency);
      } else
      {
         this.bits_timerId = null;
      }
   }



   onTipJarCupFadeout()
   {
      this.cup_opacity -= this.subtract;

      if (this.cup_opacity < 0)
      {
         this.cup_opacity = 0.0;
      }

      this.container_cup.style.opacity = this.cup_opacity;

      if (this.cup_opacity > 0)
      {
         this.cup_timerId = setTimeout(this.onTipJarCupFadeout.bind(this), this.timeoutFrequency);
      } else
      {
         this.cup_timerId = null;
      }
   }

   onSocketIoLoaded()
   {
      console.log("socket.io.js successfully loaded");

      var streamlabs = io("https://sockets.streamlabs.com?token=" + this.socketToken);
      streamlabs.on('event', (eventData) =>
      {
         console.log("streamlabs event");
         console.log("eventData.for = " + eventData.for + "   eventData.type = " + eventData.type);
         this.onStreamlabsEvent(eventData.for, eventData.type);
      });

      this.onStreamlabsEvent("initialize", "initialize");
   }

   initialize()
   {
      console.log("TipJar_Autohide::initialize");

      if (this.socketToken == null || this.socketToken == undefined || this.socketToken.length == 0)
      {
         return false;
      }

      this.container_bits = document.querySelector("canvas:first-of-type");
      this.container_cup = document.getElementById("widget");
      console.log("container_bits");
      console.log(this.container_bits);

      console.log("container_cup");
      console.log(this.container_cup);


      if (this.container_bits == null || this.container_bits == undefined)
      {
         return false;
      }

      if (this.container_cup == null || this.container_cup == undefined)
      {
         return false;
      }

      // parse configuration values, set default ones

      // assume all events, up to user to copy from TipJar.config.types (convinience method?)
      this.event_Tips = true;                // _for = streamlabs       _type = donation
      this.event_TwitchFollows = true;       // _for = twitch_account   _type = follow
      this.event_TwitchBitsCheers = true;    // _for = twitch_account   _type = bits
      this.event_TwitchSubsAndResubs = true;          // _for = twitch_account   _type = subscriptions

      if (this.config.event_Tips)
      {
         this.event_Tips = this.config.event_Tips;
      }

      if (this.config.event_TwitchFollows)
      {
         this.event_TwitchFollows = this.config.event_TwitchFollows;
      }

      if (this.config.event_TwitchBitsCheers)
      {
         this.event_TwitchBitsCheers = this.config.event_TwitchBitsCheers;
      }

      if (this.config.event_TwitchSubsAndResubs)
      {
         this.event_TwitchSubsAndResubs = this.config.event_TwitchSubsAndResubs;
      }


      // not exposed in configuration object
      this.timeoutFrequency = 16; // 60 fps

      this.fadeinDuration = 500;
      this.fadeoutDuration = 500;

      if (this.config.fadeinDuration)
      {
         this.fadeinDuration = this.config.fadeinDuration;
      }

      if (this.config.fadeoutDuration)
      {
         this.fadeoutDuration = this.config.fadeoutDuration;
      }

      this.subtract = this.timeoutFrequency / this.fadeoutDuration;
      this.addition = this.timeoutFrequency / this.fadeinDuration;

      this.cup_inactivityTimeout = 30000; // 30 seconds
      this.bits_inactivityTimeout = 28000; // 28 seconds

      if (this.config.cup_inactivityTimeout)
      {
         this.cup_inactivityTimeout = this.config.cup_inactivityTimeout;
      }

      if (this.config.bits_inactivityTimeout)
      {
         this.bits_inactivityTimeout = this.config.bits_inactivityTimeout;
      }

      this.cup_fadeinTimeout = 0;
      this.bits_fadeinTimeout = 850;

      if (this.config.cup_fadeinTimeout)
      {
         this.cup_fadeinTimeout = this.config.cup_fadeinTimeout;
      }

      if (this.config.bits_fadeinTimeout)
      {
         this.bits_fadeinTimeout = this.config.bits_fadeinTimeout;
      }

      this.cup_opacity = 1.0;
      this.bits_opacity = 1.0;

      this.cup_timerId = null;
      this.bits_timerId = null;

      $(window).on('beforeunload', this.deleteTimers.bind(this));

      $.getScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js", this.onSocketIoLoaded.bind(this));

      return true;
   }

}
