var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		bool foundHit = false;
		vec3 lightDirection = normalize(lights[i].position - position);
		
		// Check for shadows
		for ( int j=0; j<NUM_SPHERES; ++j ) {
			Sphere sphere = spheres[j];
			float a = dot(lightDirection, lightDirection);
			float b = dot(2.0 * lightDirection, position - sphere.center);
			float c = dot(position - sphere.center, position - sphere.center) - pow(sphere.radius, 2.0);
			float delta = pow(b, 2.0) - 4.0 * a * c;

			if (delta >= 0.0) {
				float t = (-b - sqrt(delta)) / (2.0 * a);
				float bias = 0.001;
	
				if (t >= bias) {
					foundHit = true;
				}
			}
		}

		// If not shadowed, perform shading using the Blinn model
		if (!foundHit) {
			vec3 blinnDirection = normalize(lightDirection + view);
			vec3 specularPart = lights[i].intensity * pow(max(0.0, dot(normal, blinnDirection)), mtl.n) * mtl.k_s;
			vec3 diffusionPart = lights[i].intensity * max(0.0, dot(lightDirection, normal)) * mtl.k_d;
			vec3 ambientPart = mtl.k_d * vec3(0.10, 0.1, 0.1);
			color += diffusionPart + specularPart + ambientPart;
		}
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// Test for ray-sphere intersection
		Sphere sphere = spheres[i];
		float a = dot(ray.dir, ray.dir);
		float b = dot(2.0 * ray.dir, ray.pos - sphere.center);
		float c = dot(ray.pos - sphere.center, ray.pos - sphere.center) - pow(sphere.radius, 2.0);
		float delta = pow(b, 2.0) - 4.0 * a * c;

		// If intersection is found, update the given HitInfo
		if (delta >= 0.0) {
			float t = (-b - sqrt(delta)) / (2.0 * a);
			
			if (t > 0.0 && t < hit.t) {
				foundHit = true;
				vec3 x = ray.pos + t * ray.dir;
				hit.t = t;
				hit.position = x;
				hit.normal = normalize(x - sphere.center);
				hit.mtl = sphere.mtl;
			}
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.pos = hit.position;
			r.dir = 2.0 * dot(view, hit.normal) * hit.normal - view;
			
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				view = normalize(-r.dir);
				k_s = h.mtl.k_s;
				clr += k_s * Shade(h.mtl, h.position, h.normal, view);
				// TO-DO: Update the loop variables for tracing the next reflection ray
				hit = h;
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;
