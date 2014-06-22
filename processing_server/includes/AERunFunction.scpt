FasdUAS 1.101.10   ��   ��    k             l      ��  ��   ��  AERunFunction
 *  chris piuggi 2014
 *
 *
 *  Applescript which takes two arguments jsx file path & jsx function to call. Passing both the file and init function allow us to pass data directly into AE from shell/bash. 
 *  The data contained in the init function can then be parsed and used by the included file afterwards.
 *  
 *	Init script via shell/bash sample:
 * 	$ osascript AERunFunction.scpt "~/Documents/Adobe Scripts/args.jsx" "main('information')"
 *
 *  Script takes the incoming argv and produces jsx to run in AfterEffects(ExtendScript) which looks like this: 
 *  #include '~/Documents/Adobe Scripts/args.jsx'; main('information');
 * 
      � 	 	      A E R u n F u n c t i o n 
   *     c h r i s   p i u g g i   2 0 1 4 
   * 
   * 
   *     A p p l e s c r i p t   w h i c h   t a k e s   t w o   a r g u m e n t s   j s x   f i l e   p a t h   &   j s x   f u n c t i o n   t o   c a l l .   P a s s i n g   b o t h   t h e   f i l e   a n d   i n i t   f u n c t i o n   a l l o w   u s   t o   p a s s   d a t a   d i r e c t l y   i n t o   A E   f r o m   s h e l l / b a s h .   
   *     T h e   d a t a   c o n t a i n e d   i n   t h e   i n i t   f u n c t i o n   c a n   t h e n   b e   p a r s e d   a n d   u s e d   b y   t h e   i n c l u d e d   f i l e   a f t e r w a r d s . 
   *     
   * 	 I n i t   s c r i p t   v i a   s h e l l / b a s h   s a m p l e : 
   *   	 $   o s a s c r i p t   A E R u n F u n c t i o n . s c p t   " ~ / D o c u m e n t s / A d o b e   S c r i p t s / a r g s . j s x "   " m a i n ( ' i n f o r m a t i o n ' ) " 
   * 
   *     S c r i p t   t a k e s   t h e   i n c o m i n g   a r g v   a n d   p r o d u c e s   j s x   t o   r u n   i n   A f t e r E f f e c t s ( E x t e n d S c r i p t )   w h i c h   l o o k s   l i k e   t h i s :   
   *     # i n c l u d e   ' ~ / D o c u m e n t s / A d o b e   S c r i p t s / a r g s . j s x ' ;   m a i n ( ' i n f o r m a t i o n ' ) ; 
   *   
     
  
 l     ��������  ��  ��     ��  i         I     �� ��
�� .aevtoappnull  �   � ****  o      ���� 0 argv  ��    k     ;       l     ��������  ��  ��        l     ��  ��    ' !check if we have argv (arguments)     �   B c h e c k   i f   w e   h a v e   a r g v   ( a r g u m e n t s )   ��  Z     ;  ��   ?         l     ����  I    �� ��
�� .corecnte****       ****  o     ���� 0 argv  ��  ��  ��    m    ����    k   
 6      ! " ! l  
 
�� # $��   # &  set our args to a string of 'js'    $ � % % @ s e t   o u r   a r g s   t o   a   s t r i n g   o f   ' j s ' "  & ' & r   
  ( ) ( b   
  * + * b   
  , - , b   
  . / . b   
  0 1 0 b   
  2 3 2 m   
  4 4 � 5 5  # i n c l u d e   ' 3 l    6���� 6 n     7 8 7 4    �� 9
�� 
cobj 9 m    ����  8 o    ���� 0 argv  ��  ��   1 m     : : � ; ;  ' ;   / l    <���� < n     = > = 4    �� ?
�� 
cobj ? m    ����  > o    ���� 0 argv  ��  ��   - m     @ @ � A A  ;   + o    ��
�� 
ret  ) o      ���� 0 js   '  B C B l   ��������  ��  ��   C  D�� D t    6 E F E O     5 G H G k   $ 4 I I  J K J l  $ $��������  ��  ��   K  L M L l  $ $�� N O��   N - 'instruct After Effects to Run Js Script    O � P P N i n s t r u c t   A f t e r   E f f e c t s   t o   R u n   J s   S c r i p t M  Q R Q r   $ + S T S I  $ )�� U��
�� .miscdoscnull���     ctxt U o   $ %���� 0 js  ��   T o      ���� 0 resp   R  V W V l  , ,�� X Y��   X  set resp to the result    Y � Z Z , s e t   r e s p   t o   t h e   r e s u l t W  [ \ [ l  , ,�� ] ^��   ]   return js # for debug only    ^ � _ _ 4 r e t u r n   j s   #   f o r   d e b u g   o n l y \  ` a ` l  , ,�� b c��   b ! return resp #for production    c � d d 6 r e t u r n   r e s p   # f o r   p r o d u c t i o n a  e�� e L   , 4 f f b   , 3 g h g b   , 1 i j i b   , / k l k m   , - m m � n n 
 R e s p : l o   - .���� 0 resp   j m   / 0 o o � p p *   S u c c e s s :   R a n   S c r i p t   h o   1 2���� 0 js  ��   H m     ! q q(                                                                                  FXTC  alis    �  Macintosh HD               �0ڲH+  ��Adobe After Effects CC.app                                     �,�!W�        ����  	                Adobe After Effects CC    �1�      �!�;    ���B  MMacintosh HD:Applications: Adobe After Effects CC: Adobe After Effects CC.app   6  A d o b e   A f t e r   E f f e c t s   C C . a p p    M a c i n t o s h   H D  >Applications/Adobe After Effects CC/Adobe After Effects CC.app  / ��   F m    ����X��  ��    L   9 ; r r m   9 : s s � t t 0 E r r o r :   N o   A r g s   S u b m i t t e d��  ��       �� u v w x����   u ��������
�� .aevtoappnull  �   � ****�� 0 js  �� 0 resp  ��   v �� ���� y z��
�� .aevtoappnull  �   � ****�� 0 argv  ��   y ���� 0 argv   z �� 4�� : @������ q���� m o s
�� .corecnte****       ****
�� 
cobj
�� 
ret �� 0 js  ��X
�� .miscdoscnull���     ctxt�� 0 resp  �� <�j  j 1��k/%�%��l/%�%�%E�O�n� �j 	E�O��%�%�%UoY � w � { {  # i n c l u d e   ' / U s e r s / c h r i s / I n c r e d i b l e M a c h i n e s / N i k e _ P h e n o m / c a m e r a P i / p r o c e s s i n g _ s e r v e r / m o d u l e s / . . / i n c l u d e s / N i k e P h e n o m F a s t T r a c k . j s x ' ;   r u n ( { " f i r s t N a m e " : " E m i l y " , " l a s t N a m e " : " " } ,   " / U s e r s / c h r i s / I n c r e d i b l e M a c h i n e s / N i k e _ P h e n o m / c a m e r a P i / p r o c e s s i n g _ s e r v e r / r o u t e s / . . / i m a g e s / M U C A Q _ 5 3 a 4 d 2 b 0 a 2 e d 3 1 f 8 1 a c b f 5 9 b / 5 3 a 4 d 2 b 0 a 2 e d 3 1 f 8 1 a c b f 5 9 b . m o v "   ,   " / U s e r s / c h r i s / I n c r e d i b l e M a c h i n e s / N i k e _ P h e n o m / c a m e r a P i / p r o c e s s i n g _ s e r v e r / r o u t e s / . . / i m a g e s / M U C A Q _ 5 3 a 4 d 2 b 0 a 2 e d 3 1 f 8 1 a c b f 5 9 b / M U C A Q _ 5 3 a 4 d 2 b 0 a 2 e d 3 1 f 8 1 a c b f 5 9 b . m o v " , " M U C A Q _ 5 3 a 4 d 2 b 0 a 2 e d 3 1 f 8 1 a c b f 5 9 b " ) ;    x � | |  0��  ascr  ��ޭ