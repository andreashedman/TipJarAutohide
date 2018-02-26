class TipJar_Autohide
{
   constructor(socketToken, config)
   {
      this.socketToken = socketToken;
      this.config = config == null ? {} : config;

   }

   deleteTimers()
   {
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

      this.cup_timerId = setTimeout(this.onTipJarCupFadein, this.cup_fadeinTimeout);
      this.bits_timerId = setTimeout(this.onTipJarBitsFadein, this.bits_fadeinTimeout);

   }

   onTipJarBitsFadein()
   {
      this.bits_opacity += this.addition;

      if (this.bits_opacity > 1)
      {
         this.bits_opacity = 1.0;
      }

      this.container_cup.style.opacity = this.bits_opacity;

      if (this.bits_opacity < 1)
      {
         this.bits_timerId = setTimeout(this.onTipJarBitsFadein, this.timeoutFrequency);
         //localStorage.setItem("autohide_bits_timerId", autohide_bits_timerId+"");
      } else
      {
         bits_timerId = setTimeout(this.onTipJarBitsFadeout, this.bits_inactivityTimeout);
         //localStorage.setItem("autohide_bits_timerId", autohide_bits_timerId+"");
      }
   }

   onTipJarCupFadein()
   {
      this.cup_opacity += this.addition;

      if (this.cup_opacity > 1)
      {
         this.cup_opacity = 1.0;
      }
      this.container_bits.style.opacity = this.cup_opacity;

       if (this.cup_opacity < 1)
      {
         this.cup_timerId = setTimeout(onTipJarCupFadein, this.timeoutFrequency);
         // 	localStorage.setItem("autohide_cup_timerId", autohide_cup_timerId+"");
      } else
      {
         this.cup_timerId = setTimeout(onTipJarCupFadeout, this.cup_inactivityTimeout);
         //   localStorage.setItem("autohide_cup_timerId", autohide_cup_timerId+"");
      }
   }


   onTipJarBitsFadeout()
   {


      this.bits_opacity -= this.subtract;
      console.log("onTipJarFadeout opacity = " + this.bits_opacity);

      if (this.bits_opacity < 0)
      {
         this.bits_opacity = 0.0;
      }

      this.container_bits.style.opacity = this.bits_opacity;
      //widget.style.opacity = autohide_opacity;

      if (this.bits_opacity > 0)
      {
         this.bits_timerId = setTimeout(this.onTipJarBitsFadeout, this.timeoutFrequency);
      } else
      {
         this.bits_timerId = null;
      }
   }



   onTipJarCupFadeout()
   {
      this.cup_opacity -= this.subtract;
      //console.log("onTipJarFadeout opacity = " + autohide_opacity);

      if (this.cup_opacity < 0)
      {
         this.cup_opacity = 0.0;
      }

      this.cup_container.style.opacity = this.cup_opacity;

      if (this.cup_opacity > 0)
      {
         this.cup_timerId = setTimeout(this.onTipJarCupFadeout, this.timeoutFrequency);
      } else
      {
         this.cup_timerId = null;
      }
   }


   onSocketIoLoaded(instance)
   {
      console.log("socket.io.js successfully loaded");
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
      this.event_Tips = true;
      this.event_TwitchFollows = true;
      this.event_TwitchBitsCheers = true;
      this.event_TwitchSubs = true;
      this.event_TwitchResubs = true;

      // not exposed in configuration object
      this.timeoutFrequency = 16; // 60 fps

      this.subtract = 0.035;
      this.addition = 0.035;

      this.cup_inactivityTimeout = 30000; // 30 seconds
      this.bits_inactivityTimeout = 28000; // 28 seconds

      this.cup_fadeinTimeout = 0;
      this.bits_fadeinTimeout = 850;

      this.cup_opacity = 1.0;
      this.bits_opacity = 1.0;

      this.cup_timerId = null;
      this.bits_timerId = null;



      //   console.log(document);

      // TODO: determina what events we are interested in, check widget (The Jar) config
      $.getScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js", this.onSocketIoLoaded.bind(null, this));


      return true;
   }

}
