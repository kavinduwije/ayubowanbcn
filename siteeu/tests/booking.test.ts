import { test } from "node:test";
import assert from "node:assert/strict";
import { inquirySchema, estimatePlan } from "../lib/booking.ts";
import { experiences } from "../lib/experiences.ts";
const valid = () => ({ name:"Test Traveler",email:"traveler@example.com",phone:"+94 77 123 4567",date:"2027-12-01",guests:2,language:"Sinhala",vehicle:"walking",experiences:["barcelona-gaudi"],message:"A relaxed day please.",consent:true,locale:"en",website:"",requestId:crypto.randomUUID() });
test("accepts a complete enquiry and normalises contact whitespace",()=>{const data=valid();data.name="  Test Traveler  ";assert.equal(inquirySchema.parse(data).name,"Test Traveler");});
test("rejects missing privacy acknowledgement",()=>{assert.equal(inquirySchema.safeParse({...valid(),consent:false}).success,false);});
test("rejects impossible dates, past dates, invalid email, and oversized notes",()=>{for(const value of [{date:"2027-02-30"},{date:"2020-01-01"},{email:"bad"},{message:"x".repeat(2501)}])assert.equal(inquirySchema.safeParse({...valid(),...value}).success,false);});
test("rejects empty, repeated, and unknown experience choices",()=>{for(const values of [[],["barcelona-gaudi","barcelona-gaudi"],["unknown"]])assert.equal(inquirySchema.safeParse({...valid(),experiences:values}).success,false);});
test("enforces vehicle capacity and integer group size",()=>{for(const value of [{vehicle:"sedan",guests:4},{vehicle:"van",guests:8},{guests:2.5},{guests:21}])assert.equal(inquirySchema.safeParse({...valid(),...value}).success,false);});
test("rejects client-provided prices and unexpected properties",()=>{assert.equal(inquirySchema.safeParse({...valid(),estimateEur:1}).success,false);});
test("calculates a private hosting estimate for a two-person group",()=>{assert.deepEqual(estimatePlan({experiences:["barcelona-gaudi"],guests:2,vehicle:"walking"}),{host:120,transport:0,total:120,custom:false});});
test("adds the transport allowance and group adjustment",()=>{assert.deepEqual(estimatePlan({experiences:["barcelona-gaudi","montserrat"],guests:4,vehicle:"van"}),{host:420,transport:320,total:740,custom:false});});
test("larger groups receive a custom quote",()=>{assert.equal(estimatePlan({experiences:["barcelona-gaudi"],guests:8,vehicle:"walking"}).custom,true);});
test("an empty selection has a zero estimate",()=>{assert.equal(estimatePlan({experiences:[],guests:2,vehicle:"walking"}).total,0);});
test("new experiences and the full catalog can be requested",()=>{
  assert.equal(inquirySchema.safeParse({...valid(),experiences:experiences.map(item=>item.slug)}).success,true);
  for(const slug of ["camp-nou-barca","gothic-quarter","barcelona-nightlife"]){
    assert.equal(inquirySchema.safeParse({...valid(),experiences:[slug]}).success,true);
  }
});
test("a quote-only experience never becomes a free or partial priced plan",()=>{
  for(const choices of [["camp-nou-barca"],["gothic-quarter"],["barcelona-nightlife"],["barcelona-gaudi","camp-nou-barca"]]){
    for(const vehicle of ["walking","sedan","van"] as const){
      assert.deepEqual(estimatePlan({experiences:choices,guests:2,vehicle}),{host:null,transport:null,total:null,custom:true});
    }
  }
});
