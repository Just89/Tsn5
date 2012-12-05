var walking : AudioClip;

function Awake () {
	audio.clip = walking;
}

function Update()
{
  //put the sound in where ever the player starts walking
  if (Input.GetAxisRaw("Horizontal") || Input.GetAxisRaw("Vertical")) {
    if(!audio.isPlaying) {
      
      audio.Play();
    }
  } else {
    audio.Stop();
  }
}