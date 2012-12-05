public var treasureObject : Transform;

var myGameObject : GameObject;
var attackTurnTime = 0.7;
var rotateSpeed = 500.0;
var attackDistance = 17.0;
var extraRunTime = 2.0;
var damage : int = 1;
var offset : float;

var didAttack : boolean = false;
var passedAttackTime : double = 0;
var attackTime : double = 2.0;

var startHealth = 50;
private var enemyHealth = startHealth;

var moveSpeed : int;
var attackRotateSpeed = 500.0;

public var healthBarTexture : Texture2D;
public var healthBarFillTexture : Texture2D;

public var isMoving : boolean = false; //private
private var verticalSpeed = 0.0;
private var collisionFlags : CollisionFlags;
public var maximumRelics : int; // GARE PLEK

// The gravity for the character
var gravity = 20.0;

var idleTime = 1.6;

var punchPosition = new Vector3 (0.4, 0, 0.7);
var punchRadius : double = 1.1;

// sounds
var idleSound : AudioClip;	// played during "idle" state.
var attackSound : AudioClip;	// played during the seek and attack modes.

private var attackAngle = 10.0;
private var isAttacking = false;
private var lastPunchTime = 0.0;

static var players : GameObject[];
var targetnr : int = -1;

// Cache a reference to the controller
private var characterController : CharacterController;
characterController = GetComponent(CharacterController);

var move : float;

function Start(){
	while (true)	
	{
		// Don't do anything when idle. And wait for player to be in range!
		// This is the perfect time for the player to attack us
		yield Idle();

		// Prepare, turn to player and attack him
		yield Attack();
	}
}

function OnGUI(){
	if(gameObject.transform.Find("pSphere2").gameObject.layer != 9){
		screenPoint = Camera.mainCamera.WorldToScreenPoint(gameObject.transform.position);
		//Create health bar
		GUI.BeginGroup (Rect(screenPoint.x-50, (Screen.height-screenPoint.y)-75, 98, 23));
			GUI.Box (Rect (0,0, 98, 23),healthBarTexture);
			GUI.BeginGroup (new Rect (0, 0, 98 * ((parseFloat(enemyHealth)*2)/100), 23));
				GUI.Box(Rect(0,5, 98, 13),healthBarFillTexture);
			GUI.EndGroup ();
		GUI.EndGroup ();
	}
}

function UpdateSmoothedMovementDirection ()
{
	var grounded = IsGrounded();
}

function IsGrounded () {
	return (collisionFlags & CollisionFlags.CollidedBelow) != 0;
}	

function ApplyGravity()
{
	// Apply gravity
	if (IsGrounded ())
		verticalSpeed = -gravity * 0.2;
	else
		verticalSpeed -= gravity * Time.deltaTime;
}

function CalculateJumpVerticalSpeed (targetJumpHeight : float)
{
	// From the jump height and gravity we deduce the upwards speed 
	// for the character to reach at the apex.
	return Mathf.Sqrt(2 * targetJumpHeight * gravity);
}

function Idle(){
	while(true){
		characterController.SimpleMove(Vector3.zero);
		yield WaitForSeconds(0.2);
		if (targetnr == -1) {
			//Debug.Log("Targetting...");
			targetPlayer();
		} else {
			return;
		}
	}
}

function RotateTowardsPosition (targetPos : Vector3, rotateSpeed : float) : float
{
	// Compute relative point and get the angle towards it
	var relative = transform.InverseTransformPoint(targetPos);
	var angle = Mathf.Atan2 (relative.x, relative.z) * Mathf.Rad2Deg;
	// Clamp it with the max rotation speed
	var maxRotation = rotateSpeed * Time.deltaTime;
	var clampedAngle = Mathf.Clamp(angle, -maxRotation, maxRotation);
	// Rotate
	transform.Rotate(0, clampedAngle, 0);
	// Return the current angle
	return angle;
}

function Attack(){
	var time : float;
	time = 0.0;
	var direction : Vector3;
	var angle : float;
	angle = 180.0;
	while (angle > 25)
	{
		try{
			offset = Vector3.Distance(transform.position, players[targetnr].transform.position);
		} catch(e)
		{
			targetnr = -1;
			return;
		}
		if (offset > attackDistance)
		{
			targetnr = -1;
			return;
		}
			
		time += Time.deltaTime;
		angle = Mathf.Abs(RotateTowardsPosition(players[targetnr].transform.position, rotateSpeed));
		move = Mathf.Clamp01((90 - angle) / 90);
		// depending on the angle, start moving
		direction = transform.TransformDirection(Vector3.forward * moveSpeed * move);
		characterController.SimpleMove(direction);
			
		yield;
	}
	
	// Run towards player
	var timer = 0.0;
	var lostSight = false;
	while (timer < extraRunTime)
	{
		try{
			offset = Vector3.Distance(transform.position, players[targetnr].transform.position);
		} catch(e){
			targetnr = -1;
			return;
		}
		if (offset > attackDistance) {
			targetnr = -1;
			//Debug.Log("Target removed; New target list: " + targets);
			return;
		}
			
		angle = RotateTowardsPosition(players[targetnr].transform.position, attackRotateSpeed);
			
		// The angle of our forward direction and the player position is larger than 50 degrees
		// That means he is out of sight
		if (Mathf.Abs(angle) > 40)
			lostSight = true;
			
		// If we lost sight then we keep running for some more time (extraRunTime). 
		// then stop attacking 
		if (lostSight)
			timer += Time.deltaTime;	
		
		// Just move forward at constant speed
		isMoving = true;
		direction = transform.TransformDirection(Vector3.forward * moveSpeed);
		characterController.SimpleMove(direction);

		// Keep looking if we are hitting our target
		// If we are, knock them out of the way dealing damage
		var pos = transform.TransformPoint(punchPosition);
		if(Time.time > lastPunchTime + 0.3 && (pos - players[targetnr].transform.position).magnitude < punchRadius)
		{
			// deal damage
			if (!didAttack) {
				if(players[targetnr].GetComponent(PlayerCombat).playerHealth-damage < 0)
				{
					//the player will die this attack, but still damage him to make him execute his logic
					players[targetnr].GetComponent(PlayerCombat).takeDamage(damage, targetnr);
					targetnr = -1;
					targetPlayer();
				}
				else 
				{
					players[targetnr].GetComponent(PlayerCombat).takeDamage(damage, targetnr);
				}
				didAttack = true;
				passedAttackTime = 0;
			}
			lastPunchTime = Time.time;
		}

		// We are not actually moving forward.
		// This probably means we ran into a wall or something. Stop attacking the player.
		if (characterController.velocity.magnitude < moveSpeed * 0.3)
			isMoving = false;
			break;
		
		// yield for one frame
		yield;
	}

	isAttacking = false;
}

function takeDamage(damage : int){
	//Debug.Log("nu enemy takedamage");
	//enemyHealth -= damage;
	//SendMessage("SyncStats", enemyHealth);
	
	if (enemyHealth-damage > 0) {
		enemyHealth -= damage;
		networkView.RPC("syncHealth", RPCMode.Others, enemyHealth, networkView.viewID);
		
		Debug.Log("Enemy health: " + enemyHealth);
	} 
	else 
	{
		var treasuresGet = GameObject.FindGameObjectsWithTag("Treasure");
		var randomChanse = Random.Range(0,2); // gives a 50% chanse to drop a relic
		
		//Debug.Log("amount of treasures: "+treasuresGet.length+", chanse: "+randomChanse);
		
		if (treasuresGet.length < 10 && randomChanse == 1)
		{
			Debug.Log("Chanse! Destroying the enemy!");
			networkView.RPC("MakeTreasure", RPCMode.Server);
			Debug.Log("Enemy dies, create Treasure");
		} else {
			Network.Destroy(myGameObject);
		}
	}
	//call RPC to sync
	//Debug.Log(enemyHealth);
	//Debug.Log(networkView.viewID);
}

@RPC
function MakeTreasure(){
	//if (Network.isServer)
	Network.Instantiate(treasureObject, transform.position, transform.rotation, 0);
	var grid = GameObject.FindGameObjectWithTag("Grid");
	networkView.RPC("placeTreasuresByEnemy", RPCMode.AllBuffered, grid.GetComponent(main).checkEnemyTile(myGameObject.transform));
	Network.Destroy(myGameObject);
}

@RPC
function placeTreasuresByEnemy(tile : int){
	var treasuresGet = GameObject.FindGameObjectsWithTag("Treasure");
	var grid = GameObject.FindGameObjectWithTag("Grid");
	var t = treasuresGet[treasuresGet.Length-1];
	//t.renderer.material.color = Color(Random.Range(0.0,1.0), Random.Range(0.0,1.0), Random.Range(0.0,1.0), 1);
	t.gameObject.layer = 0;
	t.gameObject.GetComponent(PickupScript).onTileNr = tile;
	t.gameObject.GetComponent(PickupScript).treasureNr = grid.GetComponent(main).treasureArray.length;
	
	Debug.Log("treasure placed on tile"+ tile);
	
	grid.GetComponent(main).treasureArray.push(t);
	grid.GetComponent(main).treasures.push(tile);

}

function FixedUpdate() {

	UpdateSmoothedMovementDirection();
	// Apply gravity
	// - extra power jump modifies gravity
	// - capeFly mode modifies gravity
	ApplyGravity ();
	
	if(didAttack){
		if(passedAttackTime < attackTime)
			passedAttackTime += Time.deltaTime;
		else{
			didAttack = false;
		}
	}
}

function targetPlayer() {
	players = GameObject.FindGameObjectsWithTag("Player");
	var targets = new Array();
	var closest : int;
	var closestDistance : float = -1;
	var distance : float;
	for (var i : int = 0; i < players.Length; i++) {
		distance = Vector3.Distance(transform.position, players[i].transform.position);
		if (closestDistance < 0) {
			closestDistance = distance;
			closest = i;
		} else if (distance < closestDistance) {
			closestDistance = distance;
			closest = i;
		}
	}
	if(players.Length > 0){
		if (Vector3.Distance(transform.position, players[closest].transform.position) < attackDistance) {
			targetnr = closest;
		}
	}
}

function setHealth(health: int){
	if (health > 0) {
		enemyHealth = health;
	}
	
	Debug.Log("Enemy health: " + enemyHealth);	
}

function OnDrawGizmosSelected ()
{
	Gizmos.color = Color.yellow;
	Gizmos.DrawWireSphere (transform.TransformPoint(punchPosition), punchRadius);
	Gizmos.color = Color.red;
	Gizmos.DrawWireSphere (transform.position, attackDistance);
}

@RPC
function syncHealth(health:int, enemyid:NetworkViewID) {
	if (networkView.viewID == enemyid) {
		setHealth(health);
	}
}

function GetMoving(){
	return isMoving;
}