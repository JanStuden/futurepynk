import axios from 'axios';

export const handleData = async (req,res) => {
    try {
        console.log("Request body: ", req.body);
        res.status(200).send("Hello from the server");
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const findbestRoute = async (req,res) => {
    try {
        console.log("Request body: ");
        const destination = req.query.destination;
        const origin = req.query.origin;
        let polutionCounter =  {"O3": 0.0, "CO2": 0.0, "NO2": 0.0, "NO": 0.0, "CO": 0.0};
        let totalRoute = {type:"totalMinimum", totalPolution: 100000.0, totalBestRoute: null};
        let co2Route = {type:"CO2Minimum", totalPolution: 100000.0, totalBestRoute: null};
        let NO2Route = {type:"NO2Minimum", totalPolution: 100000.0, totalBestRoute: null};
        let NORoute = {type:"NOMinimum", totalPolution: 100000.0, totalBestRoute: null};
        let CORoute = {type:"COMinimum", totalPolution: 100000.0, totalBestRoute: null};
        let fastestRoute = {type:"fastest", duration: 100000.0, totalPolution: 100000.0, totalCO2: 0.0, totalNO2: 0.0, totalNO: 0.0, totalCO: 0.0, totalO3: 0.0, totalBestRoute: null};

        const query = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=AIzaSyA3dDaBj1LBp_smJQqbICMH76Z5gUGLrtg&alternatives=true`
        const response = await axios.get(query);
        let data = response.data;
        console.log(data.routes)
        for(let i = 0; i < data.routes.length; i++){
            let route = data.routes[i];
            let steps = route.legs[0].steps;
            
            steps.forEach(step => {
                let polution =  calculatePolution(step);
                for(const key in polution){
                    polutionCounter[key] += polution[key];
                }
            })

            let totalPolution = 0.0;

            Object.values(polutionCounter).forEach(value => {
            totalPolution += value;
            });
           
            if(totalPolution < totalRoute.totalPolution){
                totalRoute.totalPolution = totalPolution;
                totalRoute.totalBestRoute = route;
            }
            if(polutionCounter.CO2 < co2Route.totalPolution){
                co2Route.totalPolution = polutionCounter.CO2;
                co2Route.totalBestRoute = route;
            }
            if(polutionCounter.NO2 < NO2Route.totalPolution){
                NO2Route.totalPolution = polutionCounter.NO2;
                NO2Route.totalBestRoute = route;
            }
            if(polutionCounter.NO < NORoute.totalPolution){
                NORoute.totalPolution = polutionCounter.NO;
                NORoute.totalBestRoute = route;
            }
            if(polutionCounter.CO < CORoute.totalPolution){
                CORoute.totalPolution = polutionCounter.CO;
                CORoute.totalBestRoute = route;
            }
            if(fastestRoute.duration > route.legs[0].duration.value){
                fastestRoute.duration = route.legs[0].duration.value;
                fastestRoute.totalBestRoute = route;
                fastestRoute.totalPolution = totalPolution;
                fastestRoute.totalCO2 = polutionCounter.CO2;
                fastestRoute.totalNO2 = polutionCounter.NO2;
                fastestRoute.totalNO = polutionCounter.NO;
                fastestRoute.totalCO = polutionCounter.CO;
                fastestRoute.totalO3 = polutionCounter.O3;
            }

        }
        let bestRoutes = [fastestRoute, totalRoute, co2Route, NO2Route, NORoute, CORoute]
        res.status(200).json(bestRoutes);
        console.log(totalRoute.totalPolution);
        console.log(co2Route.totalPolution)
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const calculatePolution = (step) => {
    return {"O3": 0.2, "CO2": 0.2, "NO2": 0.2, "NO": 0.2, "CO": 0.2};
}