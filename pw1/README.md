# SGI 2025/2026 - PW1

### Moodle Task - PW1-A
- We did not observe any differences.

![2.1](screenshots/2.1.png)

### Moodle Task - PW1-B
- Setting the rotation property (using .rotation) sets the absolute rotation of the object, so however many times you set the property, only the last call applies. However, the rotateX() function is cumulative, so when you use it you don't _set_ the object's rotation, but rather increment it.

- In WebCGF the second approach is used in the rotate() function, which multiplies the rotation matrix by the current transformation matrix.

![2.2](screenshots/2.2.png)



### Moodle Task - PW1-C

1. 
   - The shininess parameter only affects the specular component of the material, since this component simulates the glossiness or polish of a surface.
   - The ambient component is not affected, because it represents a constant term of scattered light in the environment.
   - The diffuse component is also independent of shininess, as it only describes how light is uniformly reflected on a matte surface.
  
2. 
    - Changing the point light to red produces a localized, directional red illumination with visible highlights on the surfaces it affects.

    -  Changing the ambient light to red applies a uniform red tint across the entire scene, altering the global color without direction or highlights
3. 
    - When the light moves, the bright spots (highlights) and the lit areas on objects shift. Surfaces facing the light get brighter, and surfaces facing away get darker.
    x
    - In the local illumination model, lighting is calculated per point based on the light’s position and direction, so moving the light changes how each surface is lit.


    
## Moodle Task - PW1-D
- Spot Light Source vs - Directional Light Source
    - Both of this source have a targer direction but they work in a very difrent way
        - SpotLight – Focused light in a specific area with a cone shape. Can have a soft edge (penumbra). Good for flashlights or spotlights. 
        - DirectionalLight- Is light with a diretion but it  have like an sun efect it lights the entire ambient

1. 
- When the light’s visibility was turned off, the light itself became invisible, but the helper remained visible. This is expected behavior. To hide the helper as well, we should add a boolean variable to control its visibility.

- WHen we change the cordinates y of the  target moved , so the spotlight points lower.However, the light shouldn’t appear under the table because the table is blocking it.

2. ?