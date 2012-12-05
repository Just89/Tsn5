var enemyAttackSound : AudioClip;
private var playSound:boolean = false;

function Awake () {
	audio.clip = enemyAttackSound;
}

function setPlaySound(){
	playSound = true;
}

function Update()
{
  //put the sound in where ever the player starts walking
	//if (Input.GetButtonDown("Fire1") ) {
		//playSound = true;
	//}
	if(playSound == true)
	{
		if(!audio.isPlaying) {
		
			audio.Play();
		}else{
			playSound = false;
		}
	}
}