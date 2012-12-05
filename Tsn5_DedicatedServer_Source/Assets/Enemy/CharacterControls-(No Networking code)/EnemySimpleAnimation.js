var runSpeedScale = 1.0;
var walkSpeedScale = 1.0;
var torso : Transform;
var marioController : EnemyTreeController;

function Awake ()
{
	// By default loop all animations
	animation.wrapMode = WrapMode.Loop;

	// We are in full control here - don't let any other animations play when we start
	animation.Stop();
	animation.Play("idle");
}

function Update ()
{
	//var marioController : ThirdPersonController = GetComponent(ThirdPersonController);
	var isMoving = marioController.GetMoving();

	// Fade in run
	if (isMoving == true)
	{
		//Debug.Log("walk animatie!");
		animation.CrossFade("walk"); //run
		// We fade out jumpland quick otherwise we get sliding feet
		//animation.Blend("jumpland", 0);
		//SendMessage("SyncAnimation", "walk"); //run
	}
	else
	{
		animation.CrossFade("idle");
		//SendMessage("SyncAnimation", "idle");
	}
	
	//animation["run"].normalizedSpeed = runSpeedScale;
	animation["walk"].normalizedSpeed = walkSpeedScale;
}

function DidLand () {
	//animation.Play("jumpland");
	//SendMessage("SyncAnimation", "jumpland");
}

function DidButtStomp () {
	//animation.CrossFade("buttstomp", 0.1);
	//SendMessage("SyncAnimation", "buttstomp");
	//animation.CrossFadeQueued("jumpland", 0.2);
}

function ApplyDamage () {
	//animation.CrossFade("gothit", 0.1);
	//SendMessage("SyncAnimation", "gothit");
}

function DidPunch () {
	//Debug.Log("Punching from enemy! IT'D BE BAD IF THE CODE REACHED HERE");
	animation.Play("punch");
	//SendMessage("SyncAnimation", "punch");
}


function DidWallJump ()
{
	// Wall jump animation is played without fade.
	// We are turning the character controller 180 degrees around when doing a wall jump so the animation accounts for that.
	// But we really have to make sure that the animation is in full control so 
	// that we don't do weird blends between 180 degree apart rotations
	//animation.Play ("walljump");
	//SendMessage("SyncAnimation", "walljump");
}

@script AddComponentMenu ("Third Person Player/Third Person Player Animation")