var offset : float = 0;
var key : Transform;


function Update () {
	key.transform.position.y -= offset;
	offset = Mathf.Sin(Time.realtimeSinceStartup * 2) / 2;
	key.transform.position.y += offset;
	key.GetChild(0).Rotate(Vector3.right * Time.deltaTime * 40);
	
}