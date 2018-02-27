class TipJar_Autohide
{
   constructor(socketToken, config)
   {
      this.socketToken = socketToken;
      this.config = config == null ? {} : config;

   }

   deleteTimers(instance)
   {
      console.log("TipJar_Autohide::deleteTimers");
      if (instance.cup_timerId != null)
      {
         clearTimeout(instance.cup_timerId);
         instance.cup_timerId = null;
      }

      if (instance.bits_timerId != null)
      {
         clearTimeout(instance.bits_timerId);
         instance.bits_timerId = null;
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

      this.cup_timerId = setTimeout(this.onTipJarCupFadein.bind(null,this), this.cup_fadeinTimeout);
      this.bits_timerId = setTimeout(this.onTipJarBitsFadein.bind(null,this), this.bits_fadeinTimeout);

   }

   onTipJarBitsFadein(instance)
   {

      //console.log("TipJar_Autohide::onTipJarBitsFadein");
      //console.log(this);
      //console.log( this.container_cup);
      instance.bits_opacity += instance.addition;

      if (instance.bits_opacity > 1)
      {
         instance.bits_opacity = 1.0;
      }

      instance.container_bits.style.opacity = instance.bits_opacity;

      if (instance.bits_opacity < 1)
      {
         instance.bits_timerId = setTimeout(instance.onTipJarBitsFadein.bind(null, instance), instance.timeoutFrequency);
         //localStorage.setItem("autohide_bits_timerId", autohide_bits_timerId+"");
      } else
      {
         instance.bits_timerId = setTimeout(instance.onTipJarBitsFadeout.bind(null, instance), instance.bits_inactivityTimeout);
         //localStorage.setItem("autohide_bits_timerId", autohide_bits_timerId+"");
      }
   }

   onTipJarCupFadein(instance)
   {
     // console.log("TipJar_Autohide::onTipJarCupFadein");
      //console.log(this);
      //console.log( this.container_bits);
      instance.cup_opacity += instance.addition;

      if (instance.cup_opacity > 1)
      {
         instance.cup_opacity = 1.0;
      }
      instance.container_cup.style.opacity = instance.cup_opacity;

       if (instance.cup_opacity < 1)
      {
         instance.cup_timerId = setTimeout(instance.onTipJarCupFadein.bind(null, instance), instance.timeoutFrequency);
         // 	localStorage.setItem("autohide_cup_timerId", autohide_cup_timerId+"");
      } else
      {
         instance.cup_timerId = setTimeout(instance.onTipJarCupFadeout.bind(null, instance), instance.cup_inactivityTimeout);
         //   localStorage.setItem("autohide_cup_timerId", autohide_cup_timerId+"");
      }
   }


   onTipJarBitsFadeout(instance)
   {
      /*
      console.log("TipJar_Autohide::onTipJarBitsFadeout");
      console.log("this = ");
      console.log(this);
      console.log("instance = ");
      console.log(instance);
      */
      instance.bits_opacity -= instance.subtract;
//      console.log("onTipJarFadeout opacity = " + instance.bits_opacity);

      if (instance.bits_opacity < 0)
      {
         instance.bits_opacity = 0.0;
      }

      instance.container_bits.style.opacity = instance.bits_opacity;
      //widget.style.opacity = autohide_opacity;

      if (instance.bits_opacity > 0)
      {
         instance.bits_timerId = setTimeout(instance.onTipJarBitsFadeout.bind(null, instance), instance.timeoutFrequency);
      } else
      {
         instance.bits_timerId = null;
      }
   }



   onTipJarCupFadeout(instance)
   {
      instance.cup_opacity -= instance.subtract;
      //console.log("onTipJarFadeout opacity = " + autohide_opacity);

      if (instance.cup_opacity < 0)
      {
         instance.cup_opacity = 0.0;
      }

      instance.container_cup.style.opacity = instance.cup_opacity;

      if (instance.cup_opacity > 0)
      {
         instance.cup_timerId = setTimeout(instance.onTipJarCupFadeout.bind(null, instance), instance.timeoutFrequency);
      } else
      {
         instance.cup_timerId = null;
      }
   }


   onSocketIoLoaded(instance)
   {
      console.log("socket.io.js successfully loaded");
      console.log("instance");
      console.log(instance);
      //		console.log("p equals");
      //	console.log(p);
      // 		console.log(this);

      var streamlabs = io("https://sockets.streamlabs.com?token=" + instance.socketToken);
      streamlabs.on('event', function (eventData)
      {

         console.log("streamlabs event");
         console.log("eventData.for = " + eventData.for + "   eventData.type = " + eventData.type);
         instance.onStreamlabsEvent(eventData.for, eventData.type);
      });

      instance.onStreamlabsEvent("initialize", "initialize");
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

      $(window).on('beforeunload', this.deleteTimers.bind(null, this));


      //   console.log(document);

      // TODO: determina what events we are interested in, check widget (The Jar) config
      $.getScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js", this.onSocketIoLoaded.bind(null, this));


      return true;
   }

}
