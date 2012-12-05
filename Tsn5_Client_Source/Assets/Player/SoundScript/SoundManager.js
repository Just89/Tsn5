var ambient : AudioClip;

function Awake () {
 //if level is loaded and player is loaded start this sound
 Debug.Log("sound is playing");
 //the sound is on the main camera cuz they say that is it closes to the playing player
 //then the volume is the highest
   audio.clip = ambient;
      // Then tell it to play
      audio.Play();
}