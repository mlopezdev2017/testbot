var soap = require("soap");

var soapFunctions = {},
    soapResults = {};
soapFunctions.sendCustomerAnalysis = function(customer) {

    return new Promise((resolve, reject) => {
        //Endpoint of service
        var url = "https://crediquick.apptividad.net/Apptividad/Apptividad.TimeToYes.BusinessProxy/BusinessOrchestrationService.svc?singleWsdl";

        //Force SOAP 1.2
        var soapOptions = {
            forceSoap12Headers: true
        };

        var soapHeaders = {
            "wsa:Action": "http://tempuri.org/IBusinessOrchestrationService/EnqueueCustomerAnalysisV2",
            "wsa:To": "https://crediquick.apptividad.net/Apptividad/Apptividad.TimeToYes.BusinessProxy/BusinessOrchestrationService.svc",
            "wsa:MessageID": "uuid:cd9f1851-e3e9-4aa6-875f-9b95326c1551"
        };

        soap.createClient(url, soapOptions, function(err, client) {
            if (err) return reject(err);
            client.addSoapHeader(soapHeaders, '', 'wsa', 'http://www.w3.org/2005/08/addressing'); 
            client.EnqueueCustomerAnalysisV2(customer, function(err, result) {
                if (err) return reject(err);
                return resolve(result);
            });
            //var lastReq = client.lastRequest;
        });
    });
};

module.exports = {
  functions: soapFunctions
};