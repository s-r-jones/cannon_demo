
// Replace this Cannon import with the Spark Module if you can
const CANNON = require('./cannon')
const Scene = require("Scene");
const Time = require("Time");

(async function () {
  // Rename this!
  const physicsParent = await Scene.root.findFirst('balls')

  const spheres = await physicsParent.findByPath('*')
  
  // Create cannon world and set gravity
  const world = new CANNON.World();
  world.gravity.set(0, -.005, 0)
  
  // create contact materials
  const wall = new CANNON.Material("stone");
  const ball = new CANNON.Material("ball");
  const ball_ball = new CANNON.ContactMaterial(ball, ball, {
    friction: 0.0 ,
    restitution: 1,
  });

  const ball_wall = new CANNON.ContactMaterial(ball, wall, {
    friction: 0.1 ,
    restitution: 1.0,
  });
  
  // Add materials to world
  world.addContactMaterial(ball_wall);
  world.addContactMaterial(ball_ball);

  // Create an array to keep track of our physics bodies
  const sphereBodies = [];

  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  const radius = .017;

  // Create physics body shape
  const sphereShape = new CANNON.Sphere(radius)
  // Create a body for every sphere
  for (let i = 0; i < spheres.length; i++) {
    var sphereBody = new CANNON.Body({
      mass: .4,
      // Maybe I don't need to apply radius here? 
      radius: radius,
      shape: sphereShape,
      material: ball,
    });

    // give each sphere a semi random starting point
    const randX = getRandom(-.1, .1);
    const randY = getRandom(-.1, .1);
    const randZ = getRandom(-.1, .08);

    sphereBody.position.set(randX, randY, randZ);
    // Add body to world. 
    world.add(sphereBody);
    // Add body to an array so we can use it later
    sphereBodies.push(sphereBody);
  }

  // constants for setting up our constraints
  const upVec = new CANNON.Vec3(0, 1, 0)
  const rightVec = new CANNON.Vec3(1, 0, 0)

  /**
   * Now we are set up a constraining box shape by adding planes to our world. 
   * The planes must be rotated correctly. 
   */

  // Create ground body and settings its shape and properties
  const planeShape = new CANNON.Plane()
  const groundProps = {
    mass: 0,
    position: new CANNON.Vec3(0, -.13 , 0),
    shape: planeShape,
    material: wall,
  };
  const groundBody = new CANNON.Body(groundProps);

  // Rotate the ground so it is flat (facing upwards)
  groundBody.quaternion.setFromAxisAngle(rightVec, -Math.PI / 2);

  world.addBody(groundBody);

  // Plane +y - Top of our Box
  let planeYmax = new CANNON.Body({ mass: 0, material: wall, shape: planeShape });
  planeYmax.quaternion.setFromAxisAngle(rightVec, Math.PI / 2);
  planeYmax.position.set(0, .1, 0);
  world.add(planeYmax);
  
  // plane -x
  let planeXmin = new CANNON.Body({ mass: 0, material: wall, shape: planeShape });
  planeXmin.quaternion.setFromAxisAngle(upVec, Math.PI / 2);
  planeXmin.position.set(-.09 , 0, 0);
  world.add(planeXmin);

  // Plane +x
  let planeXmax = new CANNON.Body({ mass: 0, material: wall, shape: planeShape });
  planeXmax.quaternion.setFromAxisAngle(upVec, -Math.PI / 2);
  planeXmax.position.set( .09, 0, 0);
  world.add(planeXmax);

  // Plane +z
  let planeZMax = new CANNON.Body({ mass: 0, material: wall, shape: planeShape });
  planeZMax.quaternion.setFromAxisAngle(upVec, -Math.PI)
  planeZMax.position.set(0, 0, 0.1)
  world.add(planeZMax)

   // Plane -z
   let planeZmin = new CANNON.Body({ mass: 0, material: wall, shape: planeShape });
   planeZmin.position.set(0, 0, -0.12)
   world.add(planeZmin)

  // Configure time step for Cannon
  const fixedTimeStep = 1.0 / 60.0;
  const maxSubSteps = 30;
  const timeInterval = 30;
  let lastTime;

  // Create time interval loop for cannon
  Time.setInterval(function (time) {
    if (lastTime !== undefined) {
      let dt = (time - lastTime) / 1000;
      world.step(fixedTimeStep, dt, maxSubSteps);

      for (let i = 0; i < spheres.length; i++) {
        const sphere = spheres[i];
        const sphereBody = sphereBodies[i];

        // position
        sphere.transform.x = sphereBody.position.x;
        sphere.transform.y = sphereBody.position.y;
        sphere.transform.z = sphereBody.position.z;

        // rotation
        sphere.transform.rotationX = sphereBody.quaternion.x
        sphere.transform.rotationY = sphereBody.quaternion.y
        sphere.transform.rotationZ = sphereBody.quaternion.z
                
      }
    }
    lastTime = time;
  }, timeInterval);

})();
