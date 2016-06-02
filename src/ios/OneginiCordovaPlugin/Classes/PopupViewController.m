//
//  PopupViewController.m
//  Onegini VL Test
//
//  Created by Stanisław Brzeski on 19/05/15.
//
//

#import "PopupViewController.h"
#import "OGNColorFileParser.h"

@interface PopupViewController ()

@property (weak, nonatomic) IBOutlet UIView *labelView;
@property (weak, nonatomic) IBOutlet UIView *buttonsFrame;
@property (weak, nonatomic) IBOutlet UIView *backgroundView;

@end

@implementation PopupViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.contentTextView.contentInset = UIEdgeInsetsMake(-4,-4,0,0);
    self.contentTextView.editable = NO;
    
    [self setColors];
}


-(void)setColors{
    self.labelView.backgroundColor = [OGNColorFileParser colorForKey:@"popup_header_background"];
    [self.titleLabel setTextColor:[OGNColorFileParser colorForKey:@"popupheader_text"]];
    self.backgroundView.backgroundColor = [OGNColorFileParser colorForKey:@"popup_body_background"];
    self.proceedButton.backgroundColor = [OGNColorFileParser colorForKey:@"popup_button_background"];
    self.proceedButton.titleLabel.textColor = [OGNColorFileParser colorForKey:@"popup_button_text"];
    self.cancelButton.backgroundColor = [OGNColorFileParser colorForKey:@"popup_button_background"];
    self.cancelButton.titleLabel.textColor = [OGNColorFileParser colorForKey:@"popup_button_text"];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

-(void)setPopupMessage:(NSString*)message{
    float textHeight = self.contentTextView.frame.size.height;
    self.contentTextView.text = message;
    CGRect labrect = [message boundingRectWithSize:self.contentTextView.frame.size options:NSStringDrawingUsesLineFragmentOrigin attributes:@{NSFontAttributeName:self.contentTextView.font} context:Nil];
    
    self.view.frame = CGRectMake(self.view.frame.origin.x, self.view.frame.origin.y, self.view.frame.size.width, self.view.frame.size.height-(textHeight-labrect.size.height-30));
}

- (IBAction)buttonProceedClick:(id)sender {
    self.proceedBlock();
}
- (IBAction)buttonCancelClick:(id)sender {
    self.cancelBlock();
}
- (IBAction)buttonCloseClick:(id)sender {
    self.closeBlock();
}

-(void)setCancelButtonVisible:(bool)cancelButtonVisible{
    if (cancelButtonVisible){
        self.cancelButton.hidden = NO;
        self.proceedButton.frame = CGRectMake(self.cancelButton.frame.size.width+8, 0, self.buttonsFrame.frame.size.width-(self.cancelButton.frame.size.width+8), self.buttonsFrame.frame.size.height);
    }
    else{
        self.cancelButton.hidden = YES;
        self.proceedButton.frame = CGRectMake(0, 0, self.buttonsFrame.frame.size.width, self.buttonsFrame.frame.size.height);
    }
}

@end
