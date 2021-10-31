---
title: "Blinking Lights with NodeMCU"
date: 2021-10-31T00:03:37+05:30
draft: false
---

<a href="https://en.wikipedia.org/wiki/Diwali" target="_blank">Diwali</a>, the festival of lights, is around the corner so I decided to take the hardware box out and have some fun! In this blog post, we will setup a NodeMCU (v1.0) on a linux box and then use the digital pins of the nodemcu to blink some led lights or rather led strips.

<figure style="width: 60%; margin: auto; display: block; margin-bottom: 8px;">
  <img src="/img/10/blinking_lights.png" title="Blinking LED strips"  >
  <figcaption style="font-size: 11px">
    Blinking LED strips
  <figcaption>
</figure>

### Things that we'd need:

- NodeMCU v1.0
- 5v powered led strip - the power rating here is important because we will power the led strip using NodeMCU 
- Few connecting wires
- Digital Multimeter

<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-in.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=IN&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=technoslab03-21&language=en_IN&marketplace=amazon&region=IN&placement=B07262H53W&asins=B07262H53W&linkId=8a4e40856749d20d2dce7b2a0f14f1f6&show_border=true&link_opens_in_new_window=true"></iframe>

<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-in.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=IN&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=technoslab03-21&language=en_IN&marketplace=amazon&region=IN&placement=B07DYHLFH3&asins=B07DYHLFH3&linkId=2ea93063a1246a7efa6a5dcbdd7616c5&show_border=true&link_opens_in_new_window=true"></iframe>

<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-in.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=IN&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=technoslab03-21&language=en_IN&marketplace=amazon&region=IN&placement=B00ZYFX6A2&asins=B00ZYFX6A2&linkId=a14689e514eee23e658fd4b2ecee1c2b&show_border=true&link_opens_in_new_window=true"></iframe>

<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-in.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=IN&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=technoslab03-21&language=en_IN&marketplace=amazon&region=IN&placement=B07KK5LZBK&asins=B07KK5LZBK&linkId=79ac4911e6a1d003a766243788cf137e&show_border=true&link_opens_in_new_window=true"></iframe>

### Let's begin:

1. Let's begin by setting up NodeMCU. You'd need a micro-USB data cable and connect it to your computer. A quick note here: the cable has to be a micro-USB data cable and not a charging cable because charging cables sometimes do not include data lines and that'd make your system power the nodeMCU but won't recognize it for programming.

2. Setup CP2102 drivers so that your computer can recognize NodeMCU. My operating system (Ubuntu 20.04) already includes these drivers so I didn't need to do this step. The drivers can be downloaded fro here (go to downloads tab): https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

3. Install Arduino IDE: https://www.arduino.cc/en/software/

4. Setup Arduino for NodeMCU development:
    -  Go to File > Preferences > Additional Board Manager URL and add this URL in the input field:
      
       `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
    
    - Go to Tools > Board > Board Managers and search for ESP8266 by ESP8266 community and add it

    - Go to Tools > Board > ESP8266 > NodeMCU v1.0

    - Ensure that the NodeMCU microUSB cable is plugged into the system and then go to Tools > Port > Select your NodeMCU port here. This was `ttyUSB0` for me. Ensure the NodeMCU is detected by using commands like `lsusb` and `dmesg -w` to watch for activity on the USB port

5. Once connected, let's begin programming. Start a new sketch with the following code:

```c
// data 0 pin
#define LED D0

// setup for digital write
void setup(void)
{
  pinMode(LED, OUTPUT);  
}

// turn the LED on and off
void loop()
{
  digitalWrite(LED, HIGH);
  delay(random(100, 1000)); // random delay
  digitalWrite(LED, LOW);
  delay(random(100, 1000)); // random delay
}
```

6. Compile and burn the sketch to NodeMCU and this should set the `D0` to high and low after random time intervals. To quickly debug this, I connected a LED to `D0` and `GND` using a pair of connecting wires.

7. In this following, we will connect the led strip to `D0` and `GND`. The LED strip that I used runs on 5V power, using a USB adapter and we will use this fact, to power the entire strip using NodeMCU, which also emits 5V on it's data pins. The LED strip uses enameled copper wire i.e. the two copper wires run in parallel and have a very fine, invisible insulation that prevents the `VCC` and `GND` cables from touching and short-circuiting the entire strip. 

8. At the base of the LED string, identify and separate out the copper cables and the scrape-off the thin, invisible insulation using a knife or some sharp tool. At this point, make sure the two copper wires do not touch each other. 

9. Use a digital multimeter to identify the live and ground wire. You can mark one of the cables using tape or color pens, to remember which one is ground wire. Now cut the cables at base and connect live and ground wire to `GND` and `D0` of the NodeMCU, using connecting wires.


<figure style="width: 50%; margin: auto; display: block; margin-bottom: 8px;">
  <img src="/img/10/led_strip.jpeg" title="LED strip connection"  >
  <figcaption style="font-size: 11px">
    LED strip connection
  <figcaption>
</figure>


10. Power-up the NodeMCU and you should've a blinking led strip. 

11. Play with the code to change the blinking pattern or add another strip, to another data pin and make more blinking patterns.

Thanks for reading and Happy Diwali! :) 