class TipJar_Autohide
{
   constructor(socketToken, configuration)
   {
      this.socketToken = socketToken;
      this.configuration = configuration;
   }

   initialize()
   {
      console.log("TipJar_Autohide::initialize");
      console.log(document);

      if (socketToken == null || socketToken == undefined || socketToken.length == 0)
      {
         return false;
      }


      return true;
   }

}