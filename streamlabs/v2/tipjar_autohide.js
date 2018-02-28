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
      console.log(this);
      console.log("_for = " + _for + "   _type = " + _type);
/*
      this.event_Tips = true;                // _for = streamlabs       _type = donation
      this.event_TwitchFollows = true;       // _for = twitch_account   _type = follow
      this.event_TwitchBitsCheers = true;    // _for = twitch_account   _type = bits
      this.event_TwitchSubsAndResubs = true;          // _for = twitch_account   _type = subscriptions
      */
      if (_for == "streamlabs" && _type == "donation" && !this.event_Tips)
      {
         return;
      }

      if (_for == "twitch_account" && _type == "follow" && !this.event_TwitchFollows)
      {
         return;
      }

      if (_for == "twitch_account" && _type == "bits" && !this.event_TwitchBitsCheers)
      {
         return;
      }

      if (_for == "twitch_account" && _type == "subscriptions" && !this.event_TwitchSubsAndResubs)
      {
         return;
      }

      // todo, make sure this is a event we are interested in.
      // todo, kill any previous timers, should we have a destroy method (deleteTimers) and store the object in webstorage and reset it that way?

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

      // 	autohide_bits_opacity = 1.0;
      // 	autohide_cup_opacity = 1.0;

      this.container_bits.style.opacity = this.bits_opacity;
      this.container_cup.style.opacity = this.cup_opacity;

      this.cup_timerId = setTimeout(this.onTipJarCupFadein.bind(this), this.cup_fadeinTimeout);
      this.bits_timerId = setTimeout(this.onTipJarBitsFadein.bind(this), this.bits_fadeinTimeout);

   }

   onTipJarBitsFadein()
   {

      //console.log("TipJar_Autohide::onTipJarBitsFadein");
      //console.log(this);
      //console.log( this.container_cup);
      this.bits_opacity += this.addition;

      if (this.bits_opacity > 1)
      {
         this.bits_opacity = 1.0;
      }

      this.container_bits.style.opacity = this.bits_opacity;

      if (this.bits_opacity < 1)
      {
         this.bits_timerId = setTimeout(this.onTipJarBitsFadein.bind(this), this.timeoutFrequency);
         //localStorage.setItem("autohide_bits_timerId", autohide_bits_timerId+"");
      } else
      {
         this.bits_timerId = setTimeout(this.onTipJarBitsFadeout.bind(this), this.bits_inactivityTimeout);
         //localStorage.setItem("autohide_bits_timerId", autohide_bits_timerId+"");
      }
   }

   onTipJarCupFadein()
   {
     // console.log("TipJar_Autohide::onTipJarCupFadein");
      //console.log(this);
      //console.log( this.container_bits);
      this.cup_opacity += this.addition;

      if (this.cup_opacity > 1)
      {
         this.cup_opacity = 1.0;
      }
      this.container_cup.style.opacity = this.cup_opacity;

       if (this.cup_opacity < 1)
      {
         this.cup_timerId = setTimeout(this.onTipJarCupFadein.bind(this), this.timeoutFrequency);
         // 	localStorage.setItem("autohide_cup_timerId", autohide_cup_timerId+"");
      } else
      {
         this.cup_timerId = setTimeout(this.onTipJarCupFadeout.bind(this), this.cup_inactivityTimeout);
         //   localStorage.setItem("autohide_cup_timerId", autohide_cup_timerId+"");
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

/*
   onSocketEvent(eventData)
   {
      console.log("streamlabs event");
      console.log("eventData.for = " + eventData.for + "   eventData.type = " + eventData.type);
      console.log("this = ");
      console.log(this);
      this.onStreamlabsEvent(eventData.for, eventData.type);
   }
*/
   onSocketIoLoaded()
   {
      console.log("socket.io.js successfully loaded");
  
      var streamlabs = io("https://sockets.streamlabs.com?token=" + this.socketToken);
      streamlabs.on('event', () => {
         console.log("streamlabs event");
         console.log("eventData.for = " + eventData.for + "   eventData.type = " + eventData.type);
         console.log("this = ");
         console.log(this);
         this.onStreamlabsEvent(eventData.for, eventData.type);
      });
      /*
      streamlabs.on('event', function (eventData)
      {

         console.log("streamlabs event");
         console.log("eventData.for = " + eventData.for + "   eventData.type = " + eventData.type);
         console.log("this = ");
         console.log(this);
         this.onStreamlabsEvent(eventData.for, eventData.type);
      });
      */
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

      this.subtract = 0.035;
      this.addition = 0.035;

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


      //   console.log(document);

      // TODO: determina what events we are interested in, check widget (The Jar) config
      $.getScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js", this.onSocketIoLoaded.bind(this));


      return true;
   }

}
