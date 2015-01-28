/* Licensed as open source/free software (MIT license) based on:
 http://bl.ocks.org/jfirebaugh/900762
 http://bateru.com/news/2011/03/javascript-standard-deviation-variance-average-functions/
 https://github.com/compute-io/iqr
 https://github.com/compute-io/quantile

 Authors:
 Johannes Wilm (composition, MIT)
 Athan Reines. (iqr + quantile, MIT)
 John Firebaugh (kde, CC0)
 Larry Battle (average/variance, MIT)
 */
 
function kernelDensityEstimates(sample) {
    /* Epanechnikov kernel */
    function epanechnikov(u) {
        return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0;
    }

    function average(numArr) {
        var i = numArr.length,
            sum = 0;
        while (i--) {
            sum += numArr[i];
        }
        return sum / numArr.length;
    }

    function variance(numArr) {
        var avg = average(numArr),
            i = numArr.length,
            v = 0;

        while (i--) {
            v += Math.pow((numArr[i] - avg), 2);
        }
        v /= numArr.length;
        return v;
    }

    function iqr(arr, opts) {

        function quantile(arr, p, opts) {
            if (arguments.length === 2) {
                opts = {};
            }
            var len = arr.length,
                id;

            if (!opts.sorted) {
                arr = arr.slice();
                arr.sort();
            }

            // Cases...

            // [0] 0th percentile is the minimum value...
            if (p === 0.0) {
                return arr[0];
            }
            // [1] 100th percentile is the maximum value...
            if (p === 1.0) {
                return arr[len - 1];
            }
            // Calculate the vector index marking the quantile:
            id = (len * p) - 1;

            // [2] Is the index an integer?
            if (id === Math.floor(id)) {
                // Value is the average between the value at id and id+1:
                return (arr[id] + arr[id + 1]) / 2.0;
            }
            // [3] Round up to the next index:
            id = Math.ceil(id);
            return arr[id];
        }

        if (arguments.length === 1) {
            opts = {
                'sorted': false
            };
        }
        if (!opts.sorted) {
            arr = arr.slice();
            arr.sort();
            opts.sorted = true;
        }
        return quantile(arr, 0.75, opts) - quantile(arr, 0.25, opts);
    }

    /* Automatically calculating bandwidth (h) based on calculations on top of page 1010 in www.stata.com/manuals13/r.pdf */
    var h = (0.9 * Math.min(Math.sqrt(variance(sample)), iqr(sample) / 1.349)) / (Math.pow(sample.length, 1 / 5)),
        kernel = function(u) {
            return epanechnikov(u / h) / h;
        };

    return {
        points: function(points) {


            return points.map(function(x) {
                var y = sample.map(function(v) {
                    return kernel(x - v);
                }).reduce(function(a, b) {
                    return a + b;
                }) / sample.length;
                return [x, y];
            });
        }
    }
}

