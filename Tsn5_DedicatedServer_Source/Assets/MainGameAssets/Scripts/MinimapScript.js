var target;

function Update () {
  target = GameObject.Find("Player(Clone)");
  if (target) {
    transform.position.y = target.transform.position.y + 90;
    transform.position.x = target.transform.position.x;
    transform.position.z = target.transform.position.z;
  }
}

function Start () {
  // Make the rigid body not change rotation
    if (rigidbody)
    rigidbody.freezeRotation = true;
}