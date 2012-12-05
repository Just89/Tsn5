// assign your movie file in the editor    
var movieTexture : MovieTexture;

function OnGUI()
{
  // center your movie on the screen
  var leftOffset = (Screen.width - movieTexture.width)/2;
  var topOffset = (Screen.height - movieTexture.height)/2;
  GUI.DrawTexture(Rect(leftOffset,topOffset,movieTexture.width, movieTexture.height), movieTexture);
}
function Update()
{
	if (Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.Return)){
		//Skip intro movie
		Application.LoadLevel("MasterServer");
	}
}
function Start()
{
  // we add the audio from the video as clip to the AudioSource
  audio.clip = movieTexture.audioClip;
  // start the movie (sound is synchronized automatically)
  movieTexture.Play();

  // we want to start the next scene right after the clip finished playing
  // there must be a way to get the length of the movie directly from it,
  // but I don't know it right now - this should work as well
  Invoke("LoadNewLevel", audio.clip.length);
}

function LoadNewLevel()
{
  // You will have to change this name to the name of your next scene
  Application.LoadLevel("MasterServer");
}

// your audio needs an AudioSource component
@script RequireComponent(AudioSource)