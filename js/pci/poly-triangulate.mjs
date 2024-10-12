var app={
    angle: function(a,b,c){ // angle at point b
        var v1=[b[0] - a[0], b[1] - a[1]],
            v2=[b[0] - c[0], b[1] - c[1]];
            
        return Math.acos(this.inner(v1, v2) / (this.norm(v1) * this.norm(v2)));
    },
    is_clockwise: function(a,b,c){
        return ((b[0]-a[0]) * (c[1]-a[1]) - (c[0]-a[0]) * (b[1]-a[1])) < 0 ? true : false;
    },
    clamp_index: function(x,a,b){
        x=x < a ? b : x;
        x=x > b ? a : x;
    
        return x;
    },
    norm: function(v){
        var s=0, n=v.length;

        for(var i=0; i < n; ++i){
            s += Math.pow(v[i], 2);
        }

        return Math.sqrt(s);
    },
    inner: function(a,b){
        var s=0;

        for(var i=0; i < a.length; ++i){
            s += (a[i]*b[i]);
        }

        return s;
    },
    triangulate: function(points){
        var n=points.length, m, angles=[], triangles=[], poly_cw, ear_cw, a, b, c, theta, min_ang, i, max_x;
        
        if(points[0][0] == points[n-1][0] && points[0][1] == points[n-1][1]){
            n=n-1;
        }

        m=n;

        max_x=points[0][0], i;

        for(var k=1; k < n; ++k){
            if(points[k][0] > max_x){
                max_x=points[k][0];
                i=k;
            }
        }

        h=this.clamp_index(i-1,0,n-1);
        j=this.clamp_index(i+1,0,n-1);
        
        a=points[h]; b=points[i]; c=points[j];

        poly_cw=this.is_clockwise(a,b,c);

        for(var k=0; k < n; ++k){
            a=points[k];
            b=points[(k+1)%n];
            c=points[(k+2)%n];
    
            theta=this.angle(a,b,c);
            ear_cw=this.is_clockwise(a,b,c);
    
            if(ear_cw != poly_cw){
                theta = 2*Math.PI - theta;
            }
    
            angles[(k+1)%n] = theta;
        }

    
        for(var k=0; k < m-2; ++k){
            min_ang=Math.min(...angles);
    
            i=angles.indexOf(min_ang);
    
            h=this.clamp_index(i-1,0,n-1);
            j=this.clamp_index(i+1,0,n-1);
    
            triangles.push([points[h], points[i], points[j]]);
    
            //==================== UPDATE ANGLE k - 1 ====================
            a=points[this.clamp_index(h-1,0,n-1)]; b=points[h]; c=points[j];
            ear_cw=this.is_clockwise(a,b,c);
            theta = this.angle(a,b,c);
            if(ear_cw != poly_cw) theta=2*Math.PI - theta;
            angles[h] = theta;
            //============================================================
    
    
            //==================== UPDATE ANGLE k + 1 ====================
            a=points[h]; b=points[j]; c=points[this.clamp_index(j+1,0,n-1)];
    
            ear_cw=this.is_clockwise(a,b,c);
    
            theta = this.angle(a,b,c);
    
            if(ear_cw != poly_cw) theta=2*Math.PI - theta;
    
            angles[j] = theta;
            //============================================================
    
    
    
            points.splice(i,1);
            angles.splice(i,1);
    
            n--;
        }
    
        return triangles;
    }
}


//==============================================
var points=[
    [343,392], [475,103], [245,151], [193,323],
    [91, 279], [51, 301], [25, 381], [80, 334],
    [142,418], [325,480], [340,564], [468,597]
];

var triangles=app.triangulate(points);

console.log(triangles);