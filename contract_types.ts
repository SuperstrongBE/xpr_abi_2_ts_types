type betxpr_Actions = {
  "bal.wthdrw": {
    account:string;
    symbol:string;
    contract:string
  },
  "bet.last": {
    account:string;
    answers:number
  },
  "bet.sub": {
    account:string;
    pollKey:number;
    answers:number
  },
  "gov.clsepoll": {
    pollKey:number
  },
  "gov.endpoll": {
    pollKey:number;
    result:number
  },
  "gov.openpoll": {
    pollKey:number
  },
  "gov.pollupdt": {
    pollKey:number;
    title:string;
    answers:string[];
    ticket:string;
    poolStart:number;
    poolEnd:number;
    image:string
  },
  "gov.setfees": {
    fees:number
  },
  "gov.updend": {
    pollKey:number;
    endTime:number
  },
  "poll.apprv": {
    pollKey:number
  },
  "poll.blame": {
    account:string;
    pollKey:number
  },
  "poll.cancel": {
    account:string;
    pollKey:number
  },
  "poll.claim": {
    account:string;
    pollKey:number
  },
  "poll.close": {
    
  },
  "poll.end": {
    
  },
  "poll.open": {
    owner:string;
    title:string;
    answers:string[];
    ticket:string;
    validatorsSeeds:number[];
    poolStart:number;
    poolEnd:number;
    limitToAccount:string[];
    image:string
  },
  "vldtrs.reg": {
    account:string
  },
  "vldtrs.req": {
    account:string;
    validators:string[]
  },
  "xdev.clrbal": {
    account:string;
    symbol:string
  },
  "xdev.clrplls": {
    
  },
  "xdev.pllsts": {
    pollKey:number;
    status:string
  }
}

export const betxpr = {
  'bal.wthdrw':(authorization:Authorization[],data:betxpr_Actions['bal.wthdrw']):XPRAction<'bal.wthdrw'>=>({
	account:'betxpr',
	name:'bal.wthdrw',
	authorization,
data}),
 'bet.last':(authorization:Authorization[],data:betxpr_Actions['bet.last']):XPRAction<'bet.last'>=>({
	account:'betxpr',
	name:'bet.last',
	authorization,
data}),
 'bet.sub':(authorization:Authorization[],data:betxpr_Actions['bet.sub']):XPRAction<'bet.sub'>=>({
	account:'betxpr',
	name:'bet.sub',
	authorization,
data}),
 'gov.clsepoll':(authorization:Authorization[],data:betxpr_Actions['gov.clsepoll']):XPRAction<'gov.clsepoll'>=>({
	account:'betxpr',
	name:'gov.clsepoll',
	authorization,
data}),
 'gov.endpoll':(authorization:Authorization[],data:betxpr_Actions['gov.endpoll']):XPRAction<'gov.endpoll'>=>({
	account:'betxpr',
	name:'gov.endpoll',
	authorization,
data}),
 'gov.openpoll':(authorization:Authorization[],data:betxpr_Actions['gov.openpoll']):XPRAction<'gov.openpoll'>=>({
	account:'betxpr',
	name:'gov.openpoll',
	authorization,
data}),
 'gov.pollupdt':(authorization:Authorization[],data:betxpr_Actions['gov.pollupdt']):XPRAction<'gov.pollupdt'>=>({
	account:'betxpr',
	name:'gov.pollupdt',
	authorization,
data}),
 'gov.setfees':(authorization:Authorization[],data:betxpr_Actions['gov.setfees']):XPRAction<'gov.setfees'>=>({
	account:'betxpr',
	name:'gov.setfees',
	authorization,
data}),
 'gov.updend':(authorization:Authorization[],data:betxpr_Actions['gov.updend']):XPRAction<'gov.updend'>=>({
	account:'betxpr',
	name:'gov.updend',
	authorization,
data}),
 'poll.apprv':(authorization:Authorization[],data:betxpr_Actions['poll.apprv']):XPRAction<'poll.apprv'>=>({
	account:'betxpr',
	name:'poll.apprv',
	authorization,
data}),
 'poll.blame':(authorization:Authorization[],data:betxpr_Actions['poll.blame']):XPRAction<'poll.blame'>=>({
	account:'betxpr',
	name:'poll.blame',
	authorization,
data}),
 'poll.cancel':(authorization:Authorization[],data:betxpr_Actions['poll.cancel']):XPRAction<'poll.cancel'>=>({
	account:'betxpr',
	name:'poll.cancel',
	authorization,
data}),
 'poll.claim':(authorization:Authorization[],data:betxpr_Actions['poll.claim']):XPRAction<'poll.claim'>=>({
	account:'betxpr',
	name:'poll.claim',
	authorization,
data}),
 'poll.close':(authorization:Authorization[],data:betxpr_Actions['poll.close']):XPRAction<'poll.close'>=>({
	account:'betxpr',
	name:'poll.close',
	authorization,
data}),
 'poll.end':(authorization:Authorization[],data:betxpr_Actions['poll.end']):XPRAction<'poll.end'>=>({
	account:'betxpr',
	name:'poll.end',
	authorization,
data}),
 'poll.open':(authorization:Authorization[],data:betxpr_Actions['poll.open']):XPRAction<'poll.open'>=>({
	account:'betxpr',
	name:'poll.open',
	authorization,
data}),
 'vldtrs.reg':(authorization:Authorization[],data:betxpr_Actions['vldtrs.reg']):XPRAction<'vldtrs.reg'>=>({
	account:'betxpr',
	name:'vldtrs.reg',
	authorization,
data}),
 'vldtrs.req':(authorization:Authorization[],data:betxpr_Actions['vldtrs.req']):XPRAction<'vldtrs.req'>=>({
	account:'betxpr',
	name:'vldtrs.req',
	authorization,
data}),
 'xdev.clrbal':(authorization:Authorization[],data:betxpr_Actions['xdev.clrbal']):XPRAction<'xdev.clrbal'>=>({
	account:'betxpr',
	name:'xdev.clrbal',
	authorization,
data}),
 'xdev.clrplls':(authorization:Authorization[],data:betxpr_Actions['xdev.clrplls']):XPRAction<'xdev.clrplls'>=>({
	account:'betxpr',
	name:'xdev.clrplls',
	authorization,
data}),
 'xdev.pllsts':(authorization:Authorization[],data:betxpr_Actions['xdev.pllsts']):XPRAction<'xdev.pllsts'>=>({
	account:'betxpr',
	name:'xdev.pllsts',
	authorization,
data}) 
} 
type betxpr_Tables = {
  "AccountPoolTable": {
    pollKey:number;
    betCount:number
  },
  "BalanceTable": {
    key:number;
    amount:string
  },
  "BetTable": {
    key:number;
    account:string;
    answer:number
  },
  "BlacklistTable": {
    account:string
  },
  "BlamesTable": {
    pollKey:number
  },
  "ClaimTable": {
    account:string;
    claimedAt:number
  },
  "FeesTable": {
    key:number;
    fees:number
  },
  "PollTable": {
    key:number;
    owner:string;
    title:string;
    answers:string[];
    ticket:string;
    validators:string[];
    result:number;
    poolStart:number;
    poolEnd:number;
    pollSize:number;
    limitToAccounts:string[];
    image:string;
    blame:number;
    status:string
  },
  "ValidatorsTable": {
    account:string
  }
}


    export type Authorization = {
      actor: string;
      permission: "active"|"owner"|string;
  }

    export type XPRAction<A extends keyof (betxpr_Actions)>={
      account: 'betxpr';
      name: A;
      authorization: Authorization[];
      data: betxpr_Actions[A]; 
    }
  
export type Tables<TableName extends keyof (betxpr_Tables)> = betxpr_Tables[TableName];
export type Actions<ActionName extends keyof (betxpr_Actions)> = betxpr_Actions[ActionName];
