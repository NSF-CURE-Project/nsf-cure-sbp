Disclaimer: This lesson content is provided for testing and demonstration. It is intended to check typography, mathematical rendering, page layout, scrolling, and navigation.

Vector Operations

Vectors describe quantities that have both magnitude and direction. A two-dimensional vector can be written as $\mathbf{v}=\langle v_x,v_y\rangle$, and a three-dimensional vector can be written as $\mathbf{v}=\langle v_x,v_y,v_z\rangle$.

Magnitude of a Vector

The magnitude of a vector measures its length. For $\mathbf{v}=\langle v_x,v_y\rangle$, the magnitude is:

$$\lVert\mathbf{v}\rVert=\sqrt{v_x^2+v_y^2}.$$

For a three-dimensional vector, the magnitude includes the $z$-component:

$$\lVert\mathbf{v}\rVert=\sqrt{v_x^2+v_y^2+v_z^2}.$$

For example, if $\mathbf{v}=\langle 3,4\rangle$, then:

$$\lVert\mathbf{v}\rVert=\sqrt{3^2+4^2}=\sqrt{25}=5.$$

Direction of a Vector

The direction angle of a two-dimensional vector can be found from its components:

$$\theta=\operatorname{atan2}(v_y,v_x).$$

For $\mathbf{v}=\langle 3,4\rangle$, the direction angle is:

$$\theta=\tan^{-1}\left(\frac{4}{3}\right)\approx53.1^\circ.$$

Vector Addition

Vectors are added component by component. If $\mathbf{a}=\langle a_x,a_y\rangle$ and $\mathbf{b}=\langle b_x,b_y\rangle$, then:

$$\mathbf{a}+\mathbf{b}=\langle a_x+b_x,\;a_y+b_y\rangle.$$

For example, if $\mathbf{a}=\langle2,5\rangle$ and $\mathbf{b}=\langle4,-1\rangle$, then:

$$\mathbf{a}+\mathbf{b}=\langle2+4,\;5-1\rangle=\langle6,4\rangle.$$

Vector Subtraction

Vector subtraction is also performed component by component:

$$\mathbf{a}-\mathbf{b}=\langle a_x-b_x,\;a_y-b_y\rangle.$$

This can also be understood as adding the opposite of the second vector:

$$\mathbf{a}-\mathbf{b}=\mathbf{a}+(-\mathbf{b}).$$

Scalar Multiplication

Multiplying a vector by a scalar changes its magnitude and may reverse its direction if the scalar is negative. For scalar $k$ and vector $\mathbf{v}$:

$$k\mathbf{v}=\langle kv_x,\;kv_y\rangle.$$

If $\mathbf{v}=\langle3,-2\rangle$, then:

$$2\mathbf{v}=\langle6,-4\rangle.$$

Unit Vectors

A unit vector has magnitude $1$. The unit vector in the direction of a nonzero vector $\mathbf{v}$ is:

$$\widehat{\mathbf{v}}=\frac{\mathbf{v}}{\lVert\mathbf{v}\rVert}.$$

For $\mathbf{v}=\langle3,4\rangle$, the unit vector is:

$$\widehat{\mathbf{v}}=\left\langle\frac35,\frac45\right\rangle.$$

The standard Cartesian unit vectors are:

$$\mathbf{i}=\langle1,0,0\rangle,\qquad\mathbf{j}=\langle0,1,0\rangle,\qquad\mathbf{k}=\langle0,0,1\rangle.$$

Using these unit vectors, a three-dimensional vector can be written as:

$$\mathbf{v}=v_x\mathbf{i}+v_y\mathbf{j}+v_z\mathbf{k}.$$

Resolving a Vector Into Components

If a vector has magnitude $V$ and direction angle $\theta$, its rectangular components are:

$$V_x=V\cos\theta.$$

$$V_y=V\sin\theta.$$

For a force of $100\text{ N}$ acting at $30^\circ$ above the horizontal:

$$F_x=100\cos30^\circ\approx86.6\text{ N}.$$

$$F_y=100\sin30^\circ=50\text{ N}.$$

Therefore, the force vector is:

$$\mathbf{F}=\langle86.6,50\rangle\text{ N}.$$

Resultant Vectors

The resultant vector is the sum of two or more vectors:

$$\mathbf{R}=\sum_{i=1}^{n}\mathbf{v}_i.$$

In component form:

$$R_x=\sum_{i=1}^{n}v_{x,i},\qquad R_y=\sum_{i=1}^{n}v_{y,i}.$$

The magnitude of the resultant is:

$$\lVert\mathbf{R}\rVert=\sqrt{R_x^2+R_y^2}.$$

The direction of the resultant can be found using:

$$\theta_R=\operatorname{atan2}(R_y,R_x).$$

Dot Product

The dot product combines two vectors to produce a scalar. For vectors in three dimensions:

$$\mathbf{a}\cdot\mathbf{b}=a_xb_x+a_yb_y+a_zb_z.$$

The dot product can also be written in terms of the angle between the vectors:

$$\mathbf{a}\cdot\mathbf{b}=\lVert\mathbf{a}\rVert\lVert\mathbf{b}\rVert\cos\theta.$$

For $\mathbf{a}=\langle2,3\rangle$ and $\mathbf{b}=\langle4,-1\rangle$:

$$\mathbf{a}\cdot\mathbf{b}=(2)(4)+(3)(-1)=5.$$

Two nonzero vectors are perpendicular when their dot product is zero:

$$\mathbf{a}\cdot\mathbf{b}=0.$$

Angle Between Two Vectors

For two nonzero vectors, the angle between them is:

$$\theta=\cos^{-1}\left(\frac{\mathbf{a}\cdot\mathbf{b}}{\lVert\mathbf{a}\rVert\lVert\mathbf{b}\rVert}\right).$$

A positive dot product indicates an acute angle. A zero dot product indicates a right angle. A negative dot product indicates an obtuse angle.

Vector Projection

The scalar projection of $\mathbf{a}$ onto $\mathbf{b}$ is:

$$\operatorname{comp}_{\mathbf{b}}\mathbf{a}=\frac{\mathbf{a}\cdot\mathbf{b}}{\lVert\mathbf{b}\rVert}.$$

The vector projection of $\mathbf{a}$ onto $\mathbf{b}$ is:

$$\operatorname{proj}_{\mathbf{b}}\mathbf{a}=\frac{\mathbf{a}\cdot\mathbf{b}}{\lVert\mathbf{b}\rVert^2}\mathbf{b}.$$

Cross Product

The cross product applies to three-dimensional vectors and produces a vector perpendicular to the two original vectors:

$$\mathbf{a}\times\mathbf{b}=\begin{vmatrix}\mathbf{i} & \mathbf{j} & \mathbf{k}\\a_x & a_y & a_z\\b_x & b_y & b_z\end{vmatrix}.$$

Expanding the determinant gives:

$$\mathbf{a}\times\mathbf{b}=\left\langle a_yb_z-a_zb_y,\;a_zb_x-a_xb_z,\;a_xb_y-a_yb_x\right\rangle.$$

The magnitude of the cross product is:

$$\lVert\mathbf{a}\times\mathbf{b}\rVert=\lVert\mathbf{a}\rVert\lVert\mathbf{b}\rVert\sin\theta.$$

This magnitude is also the area of the parallelogram formed by the two vectors:

$$A_{\text{parallelogram}}=\lVert\mathbf{a}\times\mathbf{b}\rVert.$$

The area of the corresponding triangle is half that value:

$$A_{\triangle}=\frac12\lVert\mathbf{a}\times\mathbf{b}\rVert.$$

Equilibrium of a Particle

A particle is in equilibrium when the sum of all forces acting on it is zero:

$$\sum\mathbf{F}=\mathbf{0}.$$

In two dimensions, this gives two scalar equations:

$$\sum F_x=0.$$

$$\sum F_y=0.$$

In three dimensions, a third equation is also required:

$$\sum F_z=0.$$

Motion and Displacement

Displacement is the change between final and initial position vectors:

$$\Delta\mathbf{r}=\mathbf{r}_f-\mathbf{r}_i.$$

Average velocity is displacement divided by elapsed time:

$$\mathbf{v}_{\mathrm{avg}}=\frac{\Delta\mathbf{r}}{\Delta t}.$$

Average acceleration is change in velocity divided by elapsed time:

$$\mathbf{a}_{\mathrm{avg}}=\frac{\Delta\mathbf{v}}{\Delta t}.$$

Summary

Vector operations provide a systematic way to analyze quantities with magnitude and direction. The most important operations include addition, subtraction, scalar multiplication, normalization, dot products, cross products, and projections.

Three core relationships are:

$$\mathbf{a}+\mathbf{b}=\langle a_x+b_x,\;a_y+b_y\rangle.$$

$$\mathbf{a}\cdot\mathbf{b}=\lVert\mathbf{a}\rVert\lVert\mathbf{b}\rVert\cos\theta.$$

$$\lVert\mathbf{a}\times\mathbf{b}\rVert=\lVert\mathbf{a}\rVert\lVert\mathbf{b}\rVert\sin\theta.$$
